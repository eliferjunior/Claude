import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const STORE_SESSION_COOKIE = 'store_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cia-da-pizza-secret-key-change-in-production';

type StoreRow = {
  id: number;
  name: string;
  login_username: string;
  login_password_hash: string;
};

function signPayload(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 });
    }

    const store = db
      .prepare(
        'SELECT id, name, login_username, login_password_hash FROM stores WHERE login_username = ?',
      )
      .get(username) as StoreRow | undefined;

    if (!store || !store.login_password_hash) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const passwordMatch = bcrypt.compareSync(password, store.login_password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const payload = {
      storeId: store.id,
      storeName: store.name,
      username: store.login_username,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    };

    const token = signPayload(payload);

    const response = NextResponse.json({
      store_id: store.id,
      store_name: store.name,
    });

    response.cookies.set(STORE_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Erro na autenticação da loja:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(STORE_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
