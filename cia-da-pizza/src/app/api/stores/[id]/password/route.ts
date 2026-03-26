import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
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

    const existing = db.prepare('SELECT id FROM stores WHERE id = ?').get(storeId);

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

    db.prepare('UPDATE stores SET login_password_hash = ? WHERE id = ?').run(passwordHash, storeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting store password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
