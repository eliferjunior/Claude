import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth, sanitizeString } from '@/lib/auth';

const STORE_SAFE_COLUMNS = `id, name, address, phone, whatsapp, opening_hours, closing_hours,
  active, is_delivery, lat, lng, allows_delivery, allows_pickup, allows_reservation,
  allows_dine_in, whatsapp_number, whatsapp_message, login_username`;

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminAuth();
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    const body = await request.json();

    const existing = db.prepare('SELECT id FROM stores WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    db.prepare(
      `UPDATE stores SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        whatsapp = COALESCE(?, whatsapp),
        opening_hours = COALESCE(?, opening_hours),
        closing_hours = COALESCE(?, closing_hours),
        active = COALESCE(?, active),
        is_delivery = COALESCE(?, is_delivery),
        lat = COALESCE(?, lat),
        lng = COALESCE(?, lng),
        allows_delivery = COALESCE(?, allows_delivery),
        allows_pickup = COALESCE(?, allows_pickup),
        allows_reservation = COALESCE(?, allows_reservation),
        allows_dine_in = COALESCE(?, allows_dine_in),
        whatsapp_number = COALESCE(?, whatsapp_number),
        whatsapp_message = COALESCE(?, whatsapp_message)
       WHERE id = ?`,
    ).run(
      sanitizeString(body.name, 200),
      sanitizeString(body.address, 500),
      sanitizeString(body.phone, 30),
      sanitizeString(body.whatsapp, 30),
      sanitizeString(body.opening_hours, 10),
      sanitizeString(body.closing_hours, 10),
      body.active !== undefined ? (body.active ? 1 : 0) : null,
      body.is_delivery !== undefined ? (body.is_delivery ? 1 : 0) : null,
      body.lat ?? null,
      body.lng ?? null,
      body.allows_delivery !== undefined ? (body.allows_delivery ? 1 : 0) : null,
      body.allows_pickup !== undefined ? (body.allows_pickup ? 1 : 0) : null,
      body.allows_reservation !== undefined ? (body.allows_reservation ? 1 : 0) : null,
      body.allows_dine_in !== undefined ? (body.allows_dine_in ? 1 : 0) : null,
      sanitizeString(body.whatsapp_number, 30),
      sanitizeString(body.whatsapp_message, 500),
      id,
    );

    const store = db.prepare(`SELECT ${STORE_SAFE_COLUMNS} FROM stores WHERE id = ?`).get(id);
    return NextResponse.json(store);
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
