import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth, sanitizeString } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);

    const product = db
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
      )
      .get(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminAuth();
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    db.prepare(
      `UPDATE products SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price_small = COALESCE(?, price_small),
        price_medium = COALESCE(?, price_medium),
        price_large = COALESCE(?, price_large),
        image_url = COALESCE(?, image_url),
        active = COALESCE(?, active)
       WHERE id = ?`,
    ).run(
      Number.isFinite(body.category_id) ? body.category_id : null,
      body.name !== undefined ? sanitizeString(body.name, 200) : null,
      body.description !== undefined ? sanitizeString(body.description, 1000) : null,
      Number.isFinite(body.price_small) ? body.price_small : null,
      Number.isFinite(body.price_medium) ? body.price_medium : null,
      Number.isFinite(body.price_large) ? body.price_large : null,
      body.image_url !== undefined ? sanitizeString(body.image_url, 500) : null,
      body.active !== undefined ? (body.active ? 1 : 0) : null,
      id,
    );

    const product = db
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
      )
      .get(id);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminAuth();
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Product deactivated' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
