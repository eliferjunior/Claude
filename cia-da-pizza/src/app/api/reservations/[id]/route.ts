import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAnyAuth(request);
    if (auth.error) return auth.error;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
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

    const { data: existing, error: existingError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Store users can only update their own reservations
    if (auth.session.type === 'store' && existing.store_id !== auth.session.store.storeId) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('[v0] Reservations PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
