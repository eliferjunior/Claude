import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('promotions')
      .select('id')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    const body = await request.json();

    if (body.banner_color !== undefined) {
      const bannerColor = sanitizeString(body.banner_color, 20);
      if (bannerColor && !/^#[0-9a-fA-F]{3,8}$/.test(bannerColor)) {
        return NextResponse.json({ error: 'Invalid banner color format' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = sanitizeString(body.title, 200);
    if (body.description !== undefined) updateData.description = sanitizeString(body.description, 1000);
    if (body.image_url !== undefined) updateData.image_url = sanitizeString(body.image_url, 500);
    if (Number.isFinite(body.discount_percent)) updateData.discount_percent = body.discount_percent;
    if (Number.isFinite(body.discount_value)) updateData.discount_value = body.discount_value;
    if (body.promo_code !== undefined) updateData.promo_code = sanitizeString(body.promo_code, 50);
    if (body.start_date) updateData.start_date = body.start_date;
    if (body.end_date) updateData.end_date = body.end_date;
    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.banner_color !== undefined) updateData.banner_color = sanitizeString(body.banner_color, 20);

    const { data: promotion, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('[v0] Promotions PUT error:', error);
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

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Promotion deleted' });
  } catch (error) {
    console.error('[v0] Promotions DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
