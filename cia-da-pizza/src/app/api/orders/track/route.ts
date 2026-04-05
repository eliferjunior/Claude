import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

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

    // Try to find by order ID first
    const orderId = parseInt(sanitized, 10);
    let order = null;

    if (!isNaN(orderId) && orderId > 0) {
      const { data } = await supabase
        .from('orders')
        .select('*, stores!inner(name)')
        .eq('id', orderId)
        .single();
      
      if (data) {
        order = {
          ...data,
          store_name: data.stores?.name,
          stores: undefined,
        };
      }
    }

    // If not found by ID, search by phone
    if (!order) {
      const { data } = await supabase
        .from('orders')
        .select('*, stores!inner(name)')
        .ilike('customer_phone', `%${sanitized}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        order = {
          ...data,
          store_name: data.stores?.name,
          stores: undefined,
        };
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) throw itemsError;

    return NextResponse.json({ ...order, items });
  } catch (error) {
    console.error('[v0] Orders track GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
