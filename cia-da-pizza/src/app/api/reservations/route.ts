import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const storeId = searchParams.get('store_id');

    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: (string | number)[] = [];

    if (storeId) {
      query += ' AND store_id = ?';
      params.push(parseInt(storeId, 10));
    }

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY date DESC, time ASC';

    const reservations = db.prepare(query).all(...params);
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { store_id, customer_name, customer_phone, customer_email, date, time, guests, notes } =
      await request.json();

    if (!store_id || !customer_name || !date || !time) {
      return NextResponse.json(
        { error: 'store_id, customer_name, date, and time are required' },
        { status: 400 },
      );
    }

    const result = db
      .prepare(
        `INSERT INTO reservations (store_id, customer_name, customer_phone, customer_email, date, time, guests, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        store_id,
        customer_name,
        customer_phone ?? null,
        customer_email ?? null,
        date,
        time,
        guests ?? 1,
        notes ?? null,
      );

    const reservation = db
      .prepare('SELECT * FROM reservations WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
