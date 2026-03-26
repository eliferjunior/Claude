import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const {
      name,
      address,
      phone,
      whatsapp,
      opening_hours,
      closing_hours,
      active,
      is_delivery,
      lat,
      lng,
      allows_delivery,
      allows_pickup,
      allows_reservation,
      allows_dine_in,
      whatsapp_number,
      whatsapp_message,
    } = await request.json();

    const existing = db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
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
      name ?? null,
      address ?? null,
      phone ?? null,
      whatsapp ?? null,
      opening_hours ?? null,
      closing_hours ?? null,
      active ?? null,
      is_delivery ?? null,
      lat ?? null,
      lng ?? null,
      allows_delivery ?? null,
      allows_pickup ?? null,
      allows_reservation ?? null,
      allows_dine_in ?? null,
      whatsapp_number ?? null,
      whatsapp_message ?? null,
      id,
    );

    const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
    return NextResponse.json(store);
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
