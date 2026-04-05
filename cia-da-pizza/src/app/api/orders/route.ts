import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';
import { sanitizeString, validateEmail, validatePhone } from '@/lib/auth';

const VALID_ORDER_TYPES = ['delivery', 'pickup', 'dine_in'];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAnyAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const storeId = searchParams.get('store_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // If store session, force filter by their store_id
    if (auth.session.type === 'store') {
      query = query.eq('store_id', auth.session.store.storeId);
    } else if (storeId) {
      query = query.eq('store_id', parseInt(storeId, 10));
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      const sanitizedSearch = sanitizeString(search, 100) ?? '';
      query = query.or(`customer_name.ilike.%${sanitizedSearch}%,customer_phone.ilike.%${sanitizedSearch}%`);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59');
    }

    if (limitParam) {
      const limit = Math.max(1, Math.min(parseInt(limitParam, 10) || 100, 1000));
      query = query.limit(limit);

      if (offsetParam) {
        const offset = Math.max(0, parseInt(offsetParam, 10) || 0);
        query = query.range(offset, offset + limit - 1);
      }
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[v0] Orders GET error:', error);
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
    const paymentMethod = sanitizeString(body.payment_method, 30) || 'pix';
    const changeFor = typeof body.change_for === 'number' ? Math.max(0, body.change_for) : 0;

    const VALID_PAYMENT_METHODS = ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito'];
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Forma de pagamento invalida.' }, { status: 400 });
    }

    if (customerEmail && !validateEmail(customerEmail)) {
      return NextResponse.json({ error: 'E-mail invalido.' }, { status: 400 });
    }
    if (customerPhone && !validatePhone(customerPhone)) {
      return NextResponse.json({ error: 'Telefone invalido.' }, { status: 400 });
    }

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
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', store_id)
      .eq('active', true)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Server-side price calculation: look up actual prices from the database
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

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price_small, price_medium, price_large')
        .eq('id', item.product_id)
        .eq('active', true)
        .single();

      if (productError || !product) {
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

    // Add delivery fee for delivery orders
    let deliveryFee = 0;
    if (order_type === 'delivery') {
      const { data: feeSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'delivery_fee')
        .single();

      deliveryFee = feeSetting ? parseFloat(feeSetting.value) || 10 : 10;
      total = Math.round((total + deliveryFee) * 100) / 100;
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_email: customerEmail,
        order_type,
        notes,
        total,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        change_for: changeFor,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = validatedItems.map(vItem => ({
      order_id: order.id,
      product_id: vItem.product_id,
      product_name: vItem.product_name,
      size: vItem.size,
      quantity: vItem.quantity,
      unit_price: vItem.unit_price,
      notes: vItem.notes,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ id: order.id, total, delivery_fee: deliveryFee }, { status: 201 });
  } catch (error) {
    console.error('[v0] Orders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
