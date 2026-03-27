import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAnyAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const storeId = searchParams.get('store_id');

    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: (string | number)[] = [];

    // Store users can only see their own reservations
    if (auth.session.type === 'store') {
      query += ' AND store_id = ?';
      params.push(auth.session.store.storeId);
    } else if (storeId) {
      query += ' AND store_id = ?';
      params.push(parseInt(storeId, 10));
    }

    if (date) {
      const sanitizedDate = sanitizeString(date, 10);
      if (sanitizedDate) {
        query += ' AND date = ?';
        params.push(sanitizedDate);
      }
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
    const body = await request.json();

    const storeId = body.store_id;
    const customerName = sanitizeString(body.customer_name, 200);
    const customerPhone = sanitizeString(body.customer_phone, 30);
    const customerEmail = sanitizeString(body.customer_email, 200);
    const date = sanitizeString(body.date, 10);
    const time = sanitizeString(body.time, 10);
    const guests = Number.isFinite(body.guests)
      ? Math.max(1, Math.min(Math.floor(body.guests), 100))
      : 1;
    const notes = sanitizeString(body.notes, 1000);

    if (!storeId || !customerName || !date || !time) {
      return NextResponse.json(
        { error: 'store_id, customer_name, date, and time are required' },
        { status: 400 },
      );
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(date + 'T00:00:00');
    if (isNaN(reservationDate.getTime())) {
      return NextResponse.json(
        { error: 'Data invalida. Use o formato AAAA-MM-DD.' },
        { status: 400 },
      );
    }
    if (reservationDate < today) {
      return NextResponse.json(
        { error: 'Nao e possivel fazer reserva para uma data no passado.' },
        { status: 400 },
      );
    }

    // Validate guests count
    if (guests < 1) {
      return NextResponse.json(
        { error: 'O numero de convidados deve ser pelo menos 1.' },
        { status: 400 },
      );
    }
    if (guests > 20) {
      return NextResponse.json(
        {
          error: 'Para grupos acima de 20 pessoas, entre em contato diretamente com a loja.',
        },
        { status: 400 },
      );
    }

    // Verify store exists
    const store = db.prepare('SELECT id FROM stores WHERE id = ? AND active = 1').get(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Loja nao encontrada.' }, { status: 404 });
    }

    const result = db
      .prepare(
        `INSERT INTO reservations (store_id, customer_name, customer_phone, customer_email, date, time, guests, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(storeId, customerName, customerPhone, customerEmail, date, time, guests, notes);

    const reservation = db
      .prepare('SELECT * FROM reservations WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
