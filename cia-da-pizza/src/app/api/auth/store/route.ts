import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(`store-login:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) },
        },
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuario e senha sao obrigatorios' }, { status: 400 });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, login_username, login_password_hash')
      .eq('login_username', username)
      .single();

    if (storeError || !store || !store.login_password_hash) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const passwordMatch = bcrypt.compareSync(password, store.login_password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        token,
        user_type: 'store',
        user_id: store.id,
        expires_at: expiresAt,
      });

    if (sessionError) throw sessionError;

    const response = NextResponse.json({
      store_id: store.id,
      store_name: store.name,
    });

    response.cookies.set('store_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('[v0] Auth store POST error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('store_session')?.value;

    if (token) {
      await supabase.from('sessions').delete().eq('token', token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('store_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error('[v0] Auth store DELETE error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
