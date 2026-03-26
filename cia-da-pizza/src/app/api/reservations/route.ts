import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth, getStoreSession, sanitizeString } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Require either admin or store session
    const adminAuth = await requireAdminAuth();
    const storeSession = getStoreSession(request);

    if (adminAuth.error && !storeSession) {
      return adminAuth.error;
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const storeId = searchParams.get('store_id');

    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: (string | number)[] = [];

    // Store users can only see their own reservations
    if (storeSession) {
      query += ' AND store_id = ?';
      params.push(storeSession.storeId);
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

    // Verify store exists
    const store = db.prepare('SELECT id FROM stores WHERE id = ? AND active = 1').get(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
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
