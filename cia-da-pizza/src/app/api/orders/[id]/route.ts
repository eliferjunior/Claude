import { NextRequest, NextResponse } from 'next/server';
import { dbGetOrderWithItems, dbGet, dbUpdate } from '@/lib/database';
import { requireAnyAuth } from '@/lib/auth-helpers';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAnyAuth(request);
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const storeId = auth.session.type === 'store' ? auth.session.store.storeId : undefined;

    const result = await dbGetOrderWithItems(id, storeId);
    if (!result) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ ...result.order, items: result.items });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const existing = await dbGet<{ id: number; store_id: number }>('orders', { id });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Store users can only update their own orders
    if (auth.session.type === 'store' && existing.store_id !== auth.session.store.storeId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await dbUpdate('orders', { id }, { status, updated_at: new Date().toISOString() });

    const order = await dbGet('orders', { id });
    return NextResponse.json(order);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
