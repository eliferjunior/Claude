import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbUpdate } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const storeId = parseInt(id, 10);

    if (isNaN(storeId)) {
      return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 });
    }

    const existing = await dbGet('stores', { id: storeId });

    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    const { new_password } = body;

    if (!new_password || typeof new_password !== 'string' || new_password.length < 6) {
      return NextResponse.json(
        { error: 'New password is required and must be at least 6 characters' },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    await dbUpdate('stores', { id: storeId }, { login_password_hash: passwordHash });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
