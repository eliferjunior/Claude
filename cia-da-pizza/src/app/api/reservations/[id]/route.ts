import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, id);

    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
