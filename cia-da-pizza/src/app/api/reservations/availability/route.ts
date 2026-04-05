import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const date = searchParams.get('date');

    if (!storeId || !date) {
      return NextResponse.json({ error: 'store_id and date are required' }, { status: 400 });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('max_reservations_per_slot')
      .eq('id', parseInt(storeId, 10))
      .eq('active', true)
      .single();

    if (storeError) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const maxPerSlot = store?.max_reservations_per_slot || 5;

    const { data: slots, error: slotsError } = await supabase
      .from('reservations')
      .select('time')
      .eq('store_id', parseInt(storeId, 10))
      .eq('date', date)
      .neq('status', 'cancelled');

    if (slotsError) throw slotsError;

    const slotMap: Record<string, number> = {};
    for (const s of slots || []) {
      slotMap[s.time] = (slotMap[s.time] || 0) + 1;
    }

    const times = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

    const availability = times.map((time) => ({
      time,
      available: maxPerSlot - (slotMap[time] || 0),
      full: (slotMap[time] || 0) >= maxPerSlot,
    }));

    return NextResponse.json({ maxPerSlot, availability });
  } catch (error) {
    console.error('[v0] Availability GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
