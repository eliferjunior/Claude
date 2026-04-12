import { NextRequest, NextResponse } from 'next/server';
import { dbRaw, dbRawGet, dbInsert, dbGet } from '@/lib/database';
import { requireAnyAuth } from '@/lib/auth-helpers';
import { sanitizeString, validateEmail, validatePhone } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAnyAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const storeId = searchParams.get('store_id');

    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: (string | number)[] = [];

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

    const reservations = await dbRaw(query, params);
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

    if (guests < 1) {
      return NextResponse.json(
        { error: 'O numero de convidados deve ser pelo menos 1.' },
        { status: 400 },
      );
    }
    if (guests > 20) {
      return NextResponse.json(
        { error: 'Para grupos acima de 20 pessoas, entre em contato diretamente com a loja.' },
        { status: 400 },
      );
    }

    const store = await dbRawGet<{
      id: number;
      allows_reservation: number;
      max_reservations: number;
      max_reservation_guests: number;
      max_reservations_per_slot: number;
    }>(
      'SELECT id, allows_reservation, max_reservations, max_reservation_guests, max_reservations_per_slot FROM stores WHERE id = ? AND active = 1',
      [storeId],
    );

    if (!store) {
      return NextResponse.json({ error: 'Loja nao encontrada.' }, { status: 404 });
    }

    if (!store.allows_reservation) {
      return NextResponse.json(
        { error: 'Esta loja nao aceita reservas no momento.' },
        { status: 400 },
      );
    }

    if (store.max_reservation_guests && guests > store.max_reservation_guests) {
      return NextResponse.json(
        {
          error: `O maximo de pessoas por reserva nesta loja e ${store.max_reservation_guests}. Para grupos maiores, entre em contato com a loja.`,
        },
        { status: 400 },
      );
    }

    const maxPerSlot = store.max_reservations_per_slot || 5;
    const slotCount = await dbRawGet<{ count: number }>(
      "SELECT COUNT(*) AS count FROM reservations WHERE store_id = ? AND date = ? AND time = ? AND status != 'cancelled'",
      [storeId, date, time],
    );

    if (slotCount && slotCount.count >= maxPerSlot) {
      return NextResponse.json(
        { error: `Horario ${time} ja esta lotado para esta data. Escolha outro horario.` },
        { status: 400 },
      );
    }

    if (store.max_reservations && store.max_reservations > 0) {
      const existingCount = await dbRawGet<{ count: number }>(
        "SELECT COUNT(*) AS count FROM reservations WHERE store_id = ? AND date = ? AND status != 'cancelled'",
        [storeId, date],
      );

      if (existingCount && existingCount.count >= store.max_reservations) {
        return NextResponse.json(
          {
            error:
              'Esta loja ja atingiu o limite de reservas para esta data. Tente outro dia ou entre em contato diretamente.',
          },
          { status: 400 },
        );
      }
    }

    const inserted = await dbInsert('reservations', {
      store_id: storeId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      date,
      time,
      guests,
      notes,
    });

    const reservation = await dbGet('reservations', { id: inserted.id as number });
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
