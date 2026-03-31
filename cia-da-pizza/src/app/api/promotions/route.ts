import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');

    let query = 'SELECT * FROM promotions';
    const params: (string | number)[] = [];

    if (activeOnly === '1') {
      const today = new Date().toISOString().split('T')[0];
      query += ' WHERE active = 1 AND start_date <= ? AND end_date >= ?';
      params.push(today, today);
    }

    query += ' ORDER BY created_at DESC';

    const promotions = db.prepare(query).all(...params);
    return NextResponse.json(promotions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
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

    const result = db
      .prepare(
        `INSERT INTO promotions (title, description, image_url, discount_percent, discount_value, promo_code, start_date, end_date, active, banner_color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        title,
        sanitizeString(body.description, 1000),
        sanitizeString(body.image_url, 500),
        Number.isFinite(body.discount_percent) ? body.discount_percent : null,
        Number.isFinite(body.discount_value) ? body.discount_value : null,
        sanitizeString(body.promo_code, 50),
        body.start_date || new Date().toISOString().split('T')[0],
        body.end_date || '2099-12-31',
        body.active !== undefined ? (body.active ? 1 : 0) : 1,
        bannerColor,
      );

    const promotion = db
      .prepare('SELECT * FROM promotions WHERE id = ?')
      .get(result.lastInsertRowid);
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
