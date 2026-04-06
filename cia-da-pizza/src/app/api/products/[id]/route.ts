import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbGetProduct, dbRawRun, dbUpdate } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);

    const product = await dbGetProduct(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    const existing = await dbGet('products', { id });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await dbRawRun(
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
      [
        Number.isFinite(body.category_id) ? body.category_id : null,
        body.name !== undefined ? sanitizeString(body.name, 200) : null,
        body.description !== undefined ? sanitizeString(body.description, 1000) : null,
        Number.isFinite(body.price_small) ? body.price_small : null,
        Number.isFinite(body.price_medium) ? body.price_medium : null,
        Number.isFinite(body.price_large) ? body.price_large : null,
        body.image_url !== undefined ? sanitizeString(body.image_url, 500) : null,
        body.active !== undefined ? (body.active ? 1 : 0) : null,
        id,
      ],
    );

    const product = await dbGetProduct(id);

    return NextResponse.json(product);
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

    const existing = await dbGet('products', { id });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await dbUpdate('products', { id }, { active: 0 });

    return NextResponse.json({ message: 'Product deactivated' });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
