import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM promotions WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    const body = await request.json();

    if (body.banner_color !== undefined) {
      const bannerColor = sanitizeString(body.banner_color, 20);
      if (bannerColor && !/^#[0-9a-fA-F]{3,8}$/.test(bannerColor)) {
        return NextResponse.json({ error: 'Invalid banner color format' }, { status: 400 });
      }
    }

    db.prepare(
      `UPDATE promotions SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        discount_percent = COALESCE(?, discount_percent),
        discount_value = COALESCE(?, discount_value),
        promo_code = COALESCE(?, promo_code),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        active = COALESCE(?, active),
        banner_color = COALESCE(?, banner_color)
       WHERE id = ?`,
    ).run(
      sanitizeString(body.title, 200),
      body.description !== undefined ? sanitizeString(body.description, 1000) : null,
      body.image_url !== undefined ? sanitizeString(body.image_url, 500) : null,
      Number.isFinite(body.discount_percent) ? body.discount_percent : null,
      Number.isFinite(body.discount_value) ? body.discount_value : null,
      body.promo_code !== undefined ? sanitizeString(body.promo_code, 50) : null,
      body.start_date || null,
      body.end_date || null,
      body.active !== undefined ? (body.active ? 1 : 0) : null,
      sanitizeString(body.banner_color, 20),
      id,
    );

    const promotion = db.prepare('SELECT * FROM promotions WHERE id = ?').get(id);
    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
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

    db.prepare('DELETE FROM promotions WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Promotion deleted' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
