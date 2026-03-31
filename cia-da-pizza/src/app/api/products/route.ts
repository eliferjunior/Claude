import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(parseInt(categoryId, 10));
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (active) {
      query += ' AND p.active = ?';
      params.push(parseInt(active, 10));
    }

    query += ' ORDER BY c.order_position ASC, p.name ASC';

    const products = db.prepare(query).all(...params);
    return NextResponse.json(products);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();

    const categoryId = Number.isFinite(body.category_id) ? body.category_id : null;
    const name = sanitizeString(body.name, 200);

    if (!categoryId || !name) {
      return NextResponse.json({ error: 'category_id and name are required' }, { status: 400 });
    }

    const result = db
      .prepare(
        `INSERT INTO products (category_id, name, description, price_small, price_medium, price_large, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        categoryId,
        name,
        sanitizeString(body.description, 1000),
        Number.isFinite(body.price_small) ? body.price_small : null,
        Number.isFinite(body.price_medium) ? body.price_medium : null,
        Number.isFinite(body.price_large) ? body.price_large : null,
        sanitizeString(body.image_url, 500),
      );

    const product = db
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
