import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: (string | number)[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { store_id, customer_name, customer_phone, customer_address, order_type, notes, items } =
      await request.json();

    if (!store_id || !customer_name || !order_type || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'store_id, customer_name, order_type, and items are required' },
        { status: 400 },
      );
    }

    const total = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0,
    );

    const insertOrder = db.prepare(
      `INSERT INTO orders (store_id, customer_name, customer_phone, customer_address, order_type, notes, total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, size, quantity, unit_price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    const createOrder = db.transaction(() => {
      const result = insertOrder.run(
        store_id,
        customer_name,
        customer_phone ?? null,
        customer_address ?? null,
        order_type,
        notes ?? null,
        total,
      );

      const orderId = result.lastInsertRowid;

      for (const item of items) {
        insertItem.run(
          orderId,
          item.product_id,
          item.product_name,
          item.size ?? null,
          item.quantity,
          item.unit_price,
          item.notes ?? null,
        );
      }

      return orderId;
    });

    const orderId = createOrder();

    return NextResponse.json({ id: orderId, total }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
