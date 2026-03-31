import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

const STORE_SAFE_COLUMNS = `id, name, address, phone, whatsapp, opening_hours, closing_hours,
  active, is_delivery, lat, lng, allows_delivery, allows_pickup, allows_reservation,
  allows_dine_in, whatsapp_number, whatsapp_message, login_username,
  max_reservations, max_reservation_guests`;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAnyAuth(request);
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    const store = db.prepare(`SELECT ${STORE_SAFE_COLUMNS} FROM stores WHERE id = ?`).get(id);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Store users can only get their own store
    if (auth.session.type === 'store' && auth.session.store!.storeId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(store);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAnyAuth(request);
    if (auth.error) return auth.error;

    // Store users can only update their own store
    if (auth.session.type === 'store' && auth.session.store!.storeId !== parseInt(params.id, 10)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
        whatsapp_message = COALESCE(?, whatsapp_message),
        max_reservations = COALESCE(?, max_reservations),
        max_reservation_guests = COALESCE(?, max_reservation_guests)
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
      Number.isFinite(body.max_reservations) ? body.max_reservations : null,
      Number.isFinite(body.max_reservation_guests) ? body.max_reservation_guests : null,
      id,
    );

    const store = db.prepare(`SELECT ${STORE_SAFE_COLUMNS} FROM stores WHERE id = ?`).get(id);
    return NextResponse.json(store);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
