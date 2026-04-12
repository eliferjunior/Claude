import { NextRequest, NextResponse } from 'next/server';
import { dbRawGet, dbRawRun, dbGet } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await dbRawGet(
      'SELECT id, username, name, role, created_at FROM admin_users WHERE id = ?',
      [userId],
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const existing = await dbGet('admin_users', { id: userId });

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
      const duplicateUser = await dbRawGet(
        'SELECT id FROM admin_users WHERE username = ? AND id != ?',
        [body.username.trim(), userId],
      );

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
    await dbRawRun(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, values);

    const user = await dbRawGet(
      'SELECT id, username, name, role, created_at FROM admin_users WHERE id = ?',
      [userId],
    );

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (userId === auth.session.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const existing = await dbGet('admin_users', { id: userId });

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await dbRawRun('DELETE FROM sessions WHERE user_id = ? AND user_type = ?', [userId, 'admin']);
    await dbRawRun('DELETE FROM admin_users WHERE id = ?', [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
