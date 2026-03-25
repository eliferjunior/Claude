import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import db from './db';
import type { AdminUser } from './db';

const SESSION_COOKIE = 'cia_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cia-da-pizza-secret-key-change-in-production';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

type SessionPayload = {
  userId: number;
  username: string;
  name: string;
  role: string;
  exp: number;
};

/**
 * Hash a plaintext password using bcrypt.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Create a signed session token (HMAC-based, not a full JWT but functionally equivalent
 * for server-side cookie auth).
 */
function signPayload(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verify and decode a signed session token. Returns null if invalid or expired.
 */
function verifyToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload;

    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Create a session for an authenticated admin user and set the cookie.
 * Call this after verifying credentials.
 */
export async function createSession(user: {
  id: number;
  username: string;
  name: string;
  role: string;
}): Promise<string> {
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const token = signPayload(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

/**
 * Get the current session from cookies. Returns the session payload or null.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Require an authenticated session. Returns the session payload or throws a redirect.
 * Use in server components and server actions.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  // Verify user still exists in database
  const user = db
    .prepare('SELECT id, username, name, role FROM admin_users WHERE id = ?')
    .get(session.userId) as Pick<AdminUser, 'id' | 'username' | 'name' | 'role'> | undefined;

  if (!user) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Destroy the current session by clearing the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Authenticate a user by username and password. Returns the user if valid, null otherwise.
 */
export async function authenticate(
  username: string,
  password: string
): Promise<Omit<AdminUser, 'password_hash'> | null> {
  const user = db
    .prepare('SELECT * FROM admin_users WHERE username = ?')
    .get(username) as AdminUser | undefined;

  if (!user) return null;

  if (!verifyPassword(password, user.password_hash)) return null;

  const { password_hash: _, ...safeUser } = user;
  return safeUser;
}
