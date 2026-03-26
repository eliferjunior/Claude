import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
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

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const name = body.name !== undefined ? sanitizeString(body.name, 200) : null;
    const orderPosition = Number.isFinite(body.order_position)
      ? Math.max(0, Math.min(body.order_position, 9999))
      : null;
    const active = body.active !== undefined ? (body.active ? 1 : 0) : null;

    db.prepare(
      'UPDATE categories SET name = COALESCE(?, name), order_position = COALESCE(?, order_position), active = COALESCE(?, active) WHERE id = ?',
    ).run(name, orderPosition, active, id);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
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

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
