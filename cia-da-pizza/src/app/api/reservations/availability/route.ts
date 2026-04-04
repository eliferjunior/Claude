import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const date = searchParams.get('date');

    if (!storeId || !date) {
      return NextResponse.json({ error: 'store_id and date are required' }, { status: 400 });
    }

    const store = db
      .prepare('SELECT max_reservations_per_slot FROM stores WHERE id = ? AND active = 1')
      .get(parseInt(storeId, 10)) as { max_reservations_per_slot: number } | undefined;

    const maxPerSlot = store?.max_reservations_per_slot || 5;

    const slots = db
      .prepare(
        "SELECT time, COUNT(*) as count FROM reservations WHERE store_id = ? AND date = ? AND status != 'cancelled' GROUP BY time",
      )
      .all(parseInt(storeId, 10), date) as { time: string; count: number }[];

    const slotMap: Record<string, number> = {};
    for (const s of slots) {
      slotMap[s.time] = s.count;
    }

    const times = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

    const availability = times.map((time) => ({
      time,
      available: maxPerSlot - (slotMap[time] || 0),
      full: (slotMap[time] || 0) >= maxPerSlot,
    }));

    return NextResponse.json({ maxPerSlot, availability });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
