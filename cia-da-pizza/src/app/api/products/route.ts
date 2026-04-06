import { NextRequest, NextResponse } from 'next/server';
import { dbGetProducts, dbInsert, dbGetProduct } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    const filters: { categoryId?: number; search?: string; active?: number } = {};
    if (categoryId) filters.categoryId = parseInt(categoryId, 10);
    if (search) filters.search = search;
    if (active) filters.active = parseInt(active, 10);

    const products = await dbGetProducts(filters);
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

    const inserted = await dbInsert('products', {
      category_id: categoryId,
      name,
      description: sanitizeString(body.description, 1000),
      price_small: Number.isFinite(body.price_small) ? body.price_small : null,
      price_medium: Number.isFinite(body.price_medium) ? body.price_medium : null,
      price_large: Number.isFinite(body.price_large) ? body.price_large : null,
      image_url: sanitizeString(body.image_url, 500),
    });

    const product = await dbGetProduct((inserted as { id: number }).id);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
