import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

type StoreRow = {
  id: number;
  name: string;
  login_username: string;
  login_password_hash: string;
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuario e senha sao obrigatorios' }, { status: 400 });
    }

    const store = db
      .prepare(
        'SELECT id, name, login_username, login_password_hash FROM stores WHERE login_username = ?',
      )
      .get(username) as StoreRow | undefined;

    if (!store || !store.login_password_hash) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const passwordMatch = bcrypt.compareSync(password, store.login_password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(
      'INSERT INTO sessions (token, user_type, user_id, expires_at) VALUES (?, ?, ?, ?)',
    ).run(token, 'store', store.id, expiresAt);

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
    console.error('Erro na autenticacao da loja:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('store_session')?.value;

  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
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
}
