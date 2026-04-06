import { NextRequest, NextResponse } from 'next/server';
import { dbTrackOrder } from '@/lib/database';

export const dynamic = 'force-dynamic';

// Public endpoint for customers to track their orders by ID or phone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search || !search.trim()) {
      return NextResponse.json({ error: 'Search parameter required' }, { status: 400 });
    }

    const sanitized = search.trim().substring(0, 100);

    const result = await dbTrackOrder(sanitized);

    if (!result) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ ...result.order, items: result.items });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
