import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbUpdate } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdminAuth(request);
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
    const { new_password, confirm_password } = body;

    if (!new_password || typeof new_password !== 'string' || new_password.length < 6) {
      return NextResponse.json(
        { error: 'New password is required and must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (new_password !== confirm_password) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    await dbUpdate('admin_users', { id: userId }, { password_hash: passwordHash });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
