import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth, getStoreSession } from '@/lib/auth';

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Require either admin or store session
    const adminAuth = await requireAdminAuth();
    const storeSession = getStoreSession(request);

    if (adminAuth.error && !storeSession) {
      return adminAuth.error;
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as
      | { store_id: number }
      | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Store users can only update their own reservations
    if (storeSession && existing.store_id !== storeSession.storeId) {
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
