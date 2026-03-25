import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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
    const id = parseInt(params.id, 10);
    const {
      category_id,
      name,
      description,
      price_small,
      price_medium,
      price_large,
      image_url,
      active,
    } = await request.json();

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
      category_id ?? null,
      name ?? null,
      description ?? null,
      price_small ?? null,
      price_medium ?? null,
      price_large ?? null,
      image_url ?? null,
      active ?? null,
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
    const id = parseInt(params.id, 10);

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
