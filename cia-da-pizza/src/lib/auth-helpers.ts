import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './db';

type AdminSession = {
  userId: number;
  username: string;
  name: string;
  role: string;
};

type StoreSession = {
  storeId: number;
  storeName: string;
  username: string;
};

type AuthResult<T> = { session: T; error?: never } | { session?: never; error: Response };

/**
 * Require admin auth for API routes.
 * Checks 'session_token' cookie, looks up in sessions table
 * where user_type='admin' and not expired, returns admin user data or 401.
 */
export async function requireAdminAuth(request: NextRequest): Promise<AuthResult<AdminSession>> {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('user_id, admin_users!inner(username, name, role)')
    .eq('token', token)
    .eq('user_type', 'admin')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const adminUser = session.admin_users as unknown as { username: string; name: string; role: string };

  return {
    session: {
      userId: session.user_id,
      username: adminUser.username,
      name: adminUser.name,
      role: adminUser.role,
    },
  };
}

/**
 * Require store auth for API routes.
 * Checks 'store_session' cookie, looks up in sessions table
 * where user_type='store' and not expired, returns store data or 401.
 */
export async function requireStoreAuth(request: NextRequest): Promise<AuthResult<StoreSession>> {
  const token = request.cookies.get('store_session')?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('user_id, stores!inner(name, login_username)')
    .eq('token', token)
    .eq('user_type', 'store')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const store = session.stores as unknown as { name: string; login_username: string };

  return {
    session: {
      storeId: session.user_id,
      storeName: store.name,
      username: store.login_username,
    },
  };
}

/**
 * Get optional auth - returns admin or store session data, or null.
 * Does not throw or return error responses.
 */
export async function getOptionalAuth(
  request: NextRequest,
): Promise<{ type: 'admin'; session: AdminSession } | { type: 'store'; session: StoreSession } | null> {
  // Try admin auth first
  const adminResult = await requireAdminAuth(request);
  if (adminResult.session) {
    return { type: 'admin', session: adminResult.session };
  }

  // Try store auth
  const storeResult = await requireStoreAuth(request);
  if (storeResult.session) {
    return { type: 'store', session: storeResult.session };
  }

  return null;
}

/**
 * Require either admin or store auth.
 * Returns the auth info or a 401 error response.
 */
export async function requireAnyAuth(
  request: NextRequest,
): Promise<AuthResult<
  | { type: 'admin'; admin: AdminSession; store?: never }
  | { type: 'store'; store: StoreSession; admin?: never }
>> {
  const adminResult = await requireAdminAuth(request);
  if (adminResult.session) {
    return {
      session: { type: 'admin', admin: adminResult.session },
    };
  }

  const storeResult = await requireStoreAuth(request);
  if (storeResult.session) {
    return {
      session: { type: 'store', store: storeResult.session },
    };
  }

  return {
    error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  };
}
