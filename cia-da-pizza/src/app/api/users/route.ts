import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const users = db
      .prepare('SELECT id, username, name, role, created_at FROM admin_users ORDER BY id ASC')
      .all();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
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

    const existing = db
      .prepare('SELECT id FROM admin_users WHERE username = ?')
      .get(username.trim());

    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db
      .prepare('INSERT INTO admin_users (username, password_hash, name, role) VALUES (?, ?, ?, ?)')
      .run(username.trim(), passwordHash, name.trim(), userRole);

    const user = db
      .prepare('SELECT id, username, name, role, created_at FROM admin_users WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
