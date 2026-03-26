import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth, sanitizeString } from '@/lib/auth';

export async function GET() {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY order_position ASC').all();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const name = sanitizeString(body.name, 200);
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const orderPosition = Number.isFinite(body.order_position)
      ? Math.max(0, Math.min(body.order_position, 9999))
      : 0;

    const result = db
      .prepare('INSERT INTO categories (name, order_position) VALUES (?, ?)')
      .run(name, orderPosition);

    const category = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
