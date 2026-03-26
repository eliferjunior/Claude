import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let query = 'SELECT * FROM stores';
    const params: number[] = [];

    if (active) {
      query += ' WHERE active = ?';
      params.push(parseInt(active, 10));
    }

    query += ' ORDER BY name ASC';

    const stores = db.prepare(query).all(...params);
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      address,
      phone,
      whatsapp,
      opening_hours,
      closing_hours,
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
        address ?? null,
        phone ?? null,
        whatsapp ?? null,
        opening_hours ?? null,
        closing_hours ?? null,
        is_delivery ?? 0,
        lat ?? null,
        lng ?? null,
        allows_delivery ?? 1,
        allows_pickup ?? 1,
        allows_reservation ?? 1,
        allows_dine_in ?? 1,
        whatsapp_number ?? '',
        whatsapp_message ?? 'Olá! Gostaria de fazer um pedido.',
      );

    const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
