import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Public endpoint for customers to track their orders by ID or phone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search || !search.trim()) {
      return NextResponse.json({ error: 'Search parameter required' }, { status: 400 });
    }

    const sanitized = search.trim().substring(0, 100);

    // Try to find by order ID first
    const orderId = parseInt(sanitized, 10);
    let order;

    if (!isNaN(orderId) && orderId > 0) {
      order = db
        .prepare(
          `
        SELECT o.*, s.name as store_name
        FROM orders o
        JOIN stores s ON o.store_id = s.id
        WHERE o.id = ?
      `,
        )
        .get(orderId);
    }

    // If not found by ID, search by phone
    if (!order) {
      order = db
        .prepare(
          `
        SELECT o.*, s.name as store_name
        FROM orders o
        JOIN stores s ON o.store_id = s.id
        WHERE o.customer_phone LIKE ?
        ORDER BY o.created_at DESC
        LIMIT 1
      `,
        )
        .get(`%${sanitized}%`);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order items
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all((order as any).id);

    return NextResponse.json({ ...order, items });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
