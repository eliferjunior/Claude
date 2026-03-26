import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAnyAuth(request);
    if (auth.error) return auth.error;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as
      | { store_id: number }
      | undefined;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Store users can only see their own orders
    if (auth.session.type === 'store' && order.store_id !== auth.session.store.storeId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    return NextResponse.json({ ...order, items });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAnyAuth(request);
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

    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as
      | { store_id: number }
      | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Store users can only update their own orders
    if (auth.session.type === 'store' && existing.store_id !== auth.session.store.storeId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
      status,
      id,
    );

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
