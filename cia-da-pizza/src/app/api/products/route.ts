import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    let query = supabase
      .from('products')
      .select('*, categories!inner(name)')
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId, 10));
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (active) {
      query = query.eq('active', active === '1');
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Transform data to match expected format
    const formattedProducts = products?.map(p => ({
      ...p,
      category_name: p.categories?.name,
      categories: undefined,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('[v0] Products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();

    const categoryId = Number.isFinite(body.category_id) ? body.category_id : null;
    const name = sanitizeString(body.name, 200);

    if (!categoryId || !name) {
      return NextResponse.json({ error: 'category_id and name are required' }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        category_id: categoryId,
        name,
        description: sanitizeString(body.description, 1000),
        price_small: Number.isFinite(body.price_small) ? body.price_small : null,
        price_medium: Number.isFinite(body.price_medium) ? body.price_medium : null,
        price_large: Number.isFinite(body.price_large) ? body.price_large : null,
        image_url: sanitizeString(body.image_url, 500),
      })
      .select('*, categories!inner(name)')
      .single();

    if (error) throw error;

    const formattedProduct = {
      ...product,
      category_name: product.categories?.name,
      categories: undefined,
    };

    return NextResponse.json(formattedProduct, { status: 201 });
  } catch (error) {
    console.error('[v0] Products POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
