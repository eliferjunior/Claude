import { NextRequest, NextResponse } from 'next/server';
import { dbRaw, dbRawGet, dbRawRun } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const users = await dbRaw(
      'SELECT id, username, name, role, created_at FROM admin_users ORDER BY id ASC',
    );

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { username, password, name, role } = body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const validRoles = ['admin', 'manager', 'editor'];
    const userRole = role && validRoles.includes(role) ? role : 'admin';

    const existing = await dbRawGet(
      'SELECT id FROM admin_users WHERE username = ?',
      [username.trim()],
    );

    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await dbRawRun(
      'INSERT INTO admin_users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [username.trim(), passwordHash, name.trim(), userRole],
    );

    const user = await dbRawGet(
      'SELECT id, username, name, role, created_at FROM admin_users WHERE id = ?',
      [result.lastInsertRowid],
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
