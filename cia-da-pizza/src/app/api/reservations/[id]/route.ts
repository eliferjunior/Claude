import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbUpdate } from '@/lib/database';
import { requireAnyAuth } from '@/lib/auth-helpers';

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAnyAuth(request);
    if (auth.error) return auth.error;

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

    const existing = await dbGet<{ store_id: number }>('reservations', { id });

    if (!existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (auth.session.type === 'store' && existing.store_id !== auth.session.store.storeId) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    await dbUpdate('reservations', { id }, { status });

    const reservation = await dbGet('reservations', { id });
    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
