import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const STORE_SAFE_COLUMNS = `id, name, address, phone, whatsapp, opening_hours, closing_hours,
  active, is_delivery, lat, lng, allows_delivery, allows_pickup, allows_reservation,
  allows_dine_in, whatsapp_number, whatsapp_message, login_username`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let query = `SELECT ${STORE_SAFE_COLUMNS} FROM stores`;
    const params: number[] = [];

    if (active) {
      query += ' WHERE active = ?';
      params.push(parseInt(active, 10));
    }

    query += ' ORDER BY name ASC';

    const stores = db.prepare(query).all(...params);
    return NextResponse.json(stores);
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

    const name = sanitizeString(body.name, 200);
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = db
      .prepare(
        `INSERT INTO stores (name, address, phone, whatsapp, opening_hours, closing_hours, is_delivery, lat, lng, allows_delivery, allows_pickup, allows_reservation, allows_dine_in, whatsapp_number, whatsapp_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        name,
        sanitizeString(body.address, 500),
        sanitizeString(body.phone, 30),
        sanitizeString(body.whatsapp, 30),
        sanitizeString(body.opening_hours, 10),
        sanitizeString(body.closing_hours, 10),
        body.is_delivery ? 1 : 0,
        body.lat ?? null,
        body.lng ?? null,
        body.allows_delivery !== undefined ? (body.allows_delivery ? 1 : 0) : 1,
        body.allows_pickup !== undefined ? (body.allows_pickup ? 1 : 0) : 1,
        body.allows_reservation !== undefined ? (body.allows_reservation ? 1 : 0) : 1,
        body.allows_dine_in !== undefined ? (body.allows_dine_in ? 1 : 0) : 1,
        sanitizeString(body.whatsapp_number, 30) ?? '',
        sanitizeString(body.whatsapp_message, 500) ?? 'Olá! Gostaria de fazer um pedido.',
      );

    const store = db
      .prepare(`SELECT ${STORE_SAFE_COLUMNS} FROM stores WHERE id = ?`)
      .get(result.lastInsertRowid);

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
