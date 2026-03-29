import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

const VALID_ORDER_TYPES = ['delivery', 'pickup', 'dine_in'];

export async function GET(request: NextRequest) {
  try {
    const auth = requireAnyAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const storeId = searchParams.get('store_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: (string | number)[] = [];

    // If store session, force filter by their store_id
    if (auth.session.type === 'store') {
      query += ' AND store_id = ?';
      params.push(auth.session.store.storeId);
    } else if (storeId) {
      query += ' AND store_id = ?';
      params.push(parseInt(storeId, 10));
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      const sanitizedSearch = sanitizeString(search, 100) ?? '';
      query += ' AND (customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(`%${sanitizedSearch}%`, `%${sanitizedSearch}%`);
    }

    if (dateFrom) {
      query += ' AND date(created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND date(created_at) <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY created_at DESC';

    if (limitParam) {
      const limit = Math.max(1, Math.min(parseInt(limitParam, 10) || 100, 1000));
      query += ' LIMIT ?';
      params.push(limit);

      if (offsetParam) {
        const offset = Math.max(0, parseInt(offsetParam, 10) || 0);
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    const orders = db.prepare(query).all(...params);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_id, order_type, items } = body;

    const customerName = sanitizeString(body.customer_name, 200);
    const customerPhone = sanitizeString(body.customer_phone, 30);
    const customerAddress = sanitizeString(body.customer_address, 500);
    const customerEmail = sanitizeString(body.customer_email, 200);
    const notes = sanitizeString(body.notes, 1000);

    if (!store_id || !customerName || !order_type || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'store_id, customer_name, order_type, and items are required' },
        { status: 400 },
      );
    }

    if (!VALID_ORDER_TYPES.includes(order_type)) {
      return NextResponse.json(
        { error: 'Invalid order_type. Must be delivery, pickup, or dine_in' },
        { status: 400 },
      );
    }

    // Verify store exists
    const store = db.prepare('SELECT id FROM stores WHERE id = ? AND active = 1').get(store_id);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Server-side price calculation: look up actual prices from the database
    // instead of trusting client-provided unit_price
    let total = 0;
    const validatedItems: {
      product_id: number;
      product_name: string;
      size: string | null;
      quantity: number;
      unit_price: number;
      notes: string | null;
    }[] = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Each item must have product_id and quantity >= 1' },
          { status: 400 },
        );
      }

      const product = db
        .prepare(
          'SELECT id, name, price_small, price_medium, price_large FROM products WHERE id = ? AND active = 1',
        )
        .get(item.product_id) as
        | {
            id: number;
            name: string;
            price_small: number | null;
            price_medium: number | null;
            price_large: number | null;
          }
        | undefined;

      if (!product) {
        return NextResponse.json(
          { error: `Product with id ${item.product_id} not found or inactive` },
          { status: 400 },
        );
      }

      // Determine the correct price based on size
      let unitPrice: number | null = null;
      const size = sanitizeString(item.size, 20);

      if (size === 'small' || size === 'P') {
        unitPrice = product.price_small;
      } else if (size === 'large' || size === 'G') {
        unitPrice = product.price_large;
      } else {
        // Default to medium (M, medium, or any other value)
        unitPrice = product.price_medium;
      }

      if (unitPrice === null || unitPrice === undefined) {
        return NextResponse.json(
          { error: `Price not available for product ${product.name} in size ${size ?? 'medium'}` },
          { status: 400 },
        );
      }

      const quantity = Math.max(1, Math.min(Math.floor(item.quantity), 99));
      total += quantity * unitPrice;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        size: size,
        quantity: quantity,
        unit_price: unitPrice,
        notes: sanitizeString(item.notes, 500),
      });
    }

    // Round total to 2 decimal places
    total = Math.round(total * 100) / 100;

    const insertOrder = db.prepare(
      `INSERT INTO orders (store_id, customer_name, customer_phone, customer_address, customer_email, order_type, notes, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, size, quantity, unit_price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    const createOrder = db.transaction(() => {
      const result = insertOrder.run(
        store_id,
        customerName,
        customerPhone,
        customerAddress,
        customerEmail,
        order_type,
        notes,
        total,
      );

      const orderId = result.lastInsertRowid;

      for (const vItem of validatedItems) {
        insertItem.run(
          orderId,
          vItem.product_id,
          vItem.product_name,
          vItem.size,
          vItem.quantity,
          vItem.unit_price,
          vItem.notes,
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
