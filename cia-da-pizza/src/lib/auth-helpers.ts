import { NextRequest, NextResponse } from 'next/server';
import { dbRawGet } from './database';

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
 */
export async function requireAdminAuth(request: NextRequest): Promise<AuthResult<AdminSession>> {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const session = await dbRawGet<{
    user_id: number;
    username: string;
    name: string;
    role: string;
  }>(
    `SELECT s.user_id, u.username, u.name, u.role
     FROM sessions s
     JOIN admin_users u ON s.user_id = u.id
     WHERE s.token = ? AND s.user_type = 'admin' AND s.expires_at > datetime('now')`,
    [token],
  );

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    session: {
      userId: session.user_id,
      username: session.username,
      name: session.name,
      role: session.role,
    },
  };
}

/**
 * Require store auth for API routes.
 */
export async function requireStoreAuth(request: NextRequest): Promise<AuthResult<StoreSession>> {
  const token = request.cookies.get('store_session')?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const session = await dbRawGet<{
    user_id: number;
    name: string;
    login_username: string;
  }>(
    `SELECT s.user_id, st.name, st.login_username
     FROM sessions s
     JOIN stores st ON s.user_id = st.id
     WHERE s.token = ? AND s.user_type = 'store' AND s.expires_at > datetime('now')`,
    [token],
  );

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    session: {
      storeId: session.user_id,
      storeName: session.name,
      username: session.login_username,
    },
  };
}

/**
 * Get optional auth - returns admin or store session data, or null.
 */
export async function getOptionalAuth(
  request: NextRequest,
): Promise<{ type: 'admin'; session: AdminSession } | { type: 'store'; session: StoreSession } | null> {
  const adminResult = await requireAdminAuth(request);
  if (adminResult.session) {
    return { type: 'admin', session: adminResult.session };
  }

  const storeResult = await requireStoreAuth(request);
  if (storeResult.session) {
    return { type: 'store', session: storeResult.session };
  }

  return null;
}

/**
 * Require either admin or store auth.
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
