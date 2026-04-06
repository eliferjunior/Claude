import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbInsert, dbDelete } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';

type StoreRow = {
  id: number;
  name: string;
  login_username: string;
  login_password_hash: string;
};

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

    const store = await dbGet<StoreRow>(
      'stores',
      { login_username: username },
      'id, name, login_username, login_password_hash',
    );

    if (!store || !store.login_password_hash) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const passwordMatch = bcrypt.compareSync(password, store.login_password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await dbInsert('sessions', {
      token,
      user_type: 'store',
      user_id: store.id,
      expires_at: expiresAt,
    });

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
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('store_session')?.value;

    if (token) {
      await dbDelete('sessions', { token });
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
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
