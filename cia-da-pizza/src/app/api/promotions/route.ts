import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');

    let query = supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly === '1') {
      const today = new Date().toISOString().split('T')[0];
      query = query
        .eq('active', true)
        .lte('start_date', today)
        .gte('end_date', today);
    }

    const { data: promotions, error } = await query;

    if (error) throw error;

    return NextResponse.json(promotions);
  } catch (error) {
    console.error('[v0] Promotions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();

    const title = sanitizeString(body.title, 200);
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const bannerColor = sanitizeString(body.banner_color, 20) || '#dc2626';
    if (!/^#[0-9a-fA-F]{3,8}$/.test(bannerColor)) {
      return NextResponse.json({ error: 'Invalid banner color format' }, { status: 400 });
    }

    const { data: promotion, error } = await supabase
      .from('promotions')
      .insert({
        title,
        description: sanitizeString(body.description, 1000),
        image_url: sanitizeString(body.image_url, 500),
        discount_percent: Number.isFinite(body.discount_percent) ? body.discount_percent : null,
        discount_value: Number.isFinite(body.discount_value) ? body.discount_value : null,
        promo_code: sanitizeString(body.promo_code, 50),
        start_date: body.start_date || new Date().toISOString().split('T')[0],
        end_date: body.end_date || '2099-12-31',
        active: body.active ?? true,
        banner_color: bannerColor,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('[v0] Promotions POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
