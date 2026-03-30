import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';
import { sanitizeString, validateEmail, validatePhone } from '@/lib/auth';

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

    if (customerEmail && !validateEmail(customerEmail)) {
      return NextResponse.json({ error: 'E-mail invalido.' }, { status: 400 });
    }
    if (customerPhone && !validatePhone(customerPhone)) {
      return NextResponse.json({ error: 'Telefone invalido.' }, { status: 400 });
    }

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

    // Verify store exists and check settings
    const store = db
      .prepare(
        'SELECT id, allows_reservation, max_reservations, max_reservation_guests FROM stores WHERE id = ? AND active = 1',
      )
      .get(storeId) as
      | {
          id: number;
          allows_reservation: number;
          max_reservations: number;
          max_reservation_guests: number;
        }
      | undefined;

    if (!store) {
      return NextResponse.json({ error: 'Loja nao encontrada.' }, { status: 404 });
    }

    // Check if store accepts reservations
    if (!store.allows_reservation) {
      return NextResponse.json(
        { error: 'Esta loja nao aceita reservas no momento.' },
        { status: 400 },
      );
    }

    // Check guest limit per store
    if (store.max_reservation_guests && guests > store.max_reservation_guests) {
      return NextResponse.json(
        {
          error: `O maximo de pessoas por reserva nesta loja e ${store.max_reservation_guests}. Para grupos maiores, entre em contato com a loja.`,
        },
        { status: 400 },
      );
    }

    // Check daily reservation limit
    if (store.max_reservations && store.max_reservations > 0) {
      const existingCount = db
        .prepare(
          "SELECT COUNT(*) AS count FROM reservations WHERE store_id = ? AND date = ? AND status != 'cancelled'",
        )
        .get(storeId, date) as { count: number };

      if (existingCount.count >= store.max_reservations) {
        return NextResponse.json(
          {
            error:
              'Esta loja ja atingiu o limite de reservas para esta data. Tente outro dia ou entre em contato diretamente.',
          },
          { status: 400 },
        );
      }
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
