import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = db
      .prepare('SELECT id, username, name, role, created_at FROM admin_users WHERE id = ?')
      .get(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM admin_users WHERE id = ?').get(userId);

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (body.name && typeof body.name === 'string' && body.name.trim().length > 0) {
      updates.push('name = ?');
      values.push(body.name.trim());
    }

    if (body.role && typeof body.role === 'string') {
      const validRoles = ['admin', 'manager', 'editor'];
      if (validRoles.includes(body.role)) {
        updates.push('role = ?');
        values.push(body.role);
      }
    }

    if (body.username && typeof body.username === 'string' && body.username.trim().length > 0) {
      const duplicateUser = db
        .prepare('SELECT id FROM admin_users WHERE username = ? AND id != ?')
        .get(body.username.trim(), userId);

      if (duplicateUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }

      updates.push('username = ?');
      values.push(body.username.trim());
    }

    if (body.password && typeof body.password === 'string' && body.password.length >= 6) {
      const passwordHash = await bcrypt.hash(body.password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(userId);
    db.prepare(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const user = db
      .prepare('SELECT id, username, name, role, created_at FROM admin_users WHERE id = ?')
      .get(userId);

    return NextResponse.json(user);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (userId === auth.session.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM admin_users WHERE id = ?').get(userId);

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user sessions
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND user_type = ?').run(userId, 'admin');

    // Delete user
    db.prepare('DELETE FROM admin_users WHERE id = ?').run(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
