import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRawRun, dbDelete } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    const existing = await dbGet('categories', { id });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const name = body.name !== undefined ? sanitizeString(body.name, 200) : null;
    const orderPosition = Number.isFinite(body.order_position)
      ? Math.max(0, Math.min(body.order_position, 9999))
      : null;
    const active = body.active !== undefined ? (body.active ? 1 : 0) : null;

    await dbRawRun(
      'UPDATE categories SET name = COALESCE(?, name), order_position = COALESCE(?, order_position), active = COALESCE(?, active) WHERE id = ?',
      [name, orderPosition, active, id],
    );

    const category = await dbGet('categories', { id });
    return NextResponse.json(category);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = await dbGet('categories', { id });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await dbDelete('categories', { id });

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
