import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const STORE_SESSION_COOKIE = 'store_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cia-da-pizza-secret-key-change-in-production';

type StoreSessionPayload = {
  storeId: number;
  storeName: string;
  username: string;
  exp: number;
};

function verifyToken(token: string): StoreSessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as StoreSessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(STORE_SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
  }

  return NextResponse.json({
    store_id: payload.storeId,
    store_name: payload.storeName,
    username: payload.username,
  });
}
