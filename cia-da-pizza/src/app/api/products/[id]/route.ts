import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories!inner(name)')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formattedProduct = {
      ...product,
      category_name: product.categories?.name,
      categories: undefined,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('[v0] Products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    const { data: existing, error: existingError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (Number.isFinite(body.category_id)) updateData.category_id = body.category_id;
    if (body.name !== undefined) updateData.name = sanitizeString(body.name, 200);
    if (body.description !== undefined) updateData.description = sanitizeString(body.description, 1000);
    if (Number.isFinite(body.price_small)) updateData.price_small = body.price_small;
    if (Number.isFinite(body.price_medium)) updateData.price_medium = body.price_medium;
    if (Number.isFinite(body.price_large)) updateData.price_large = body.price_large;
    if (body.image_url !== undefined) updateData.image_url = sanitizeString(body.image_url, 500);
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select('*, categories!inner(name)')
      .single();

    if (error) throw error;

    const formattedProduct = {
      ...product,
      category_name: product.categories?.name,
      categories: undefined,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('[v0] Products PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete - just deactivate
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Product deactivated' });
  } catch (error) {
    console.error('[v0] Products DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
