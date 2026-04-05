import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    // Use Sao Paulo timezone for proper Brazilian date calculation
    const now = new Date();
    const brDate = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const startOfDay = `${brDate}T00:00:00`;
    const endOfDay = `${brDate}T23:59:59`;

    // Orders today
    const { count: ordersToday } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Reservations today
    const { count: reservationsToday } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('date', brDate);

    // Revenue today
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .neq('status', 'cancelled');

    const revenueToday = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, stores!inner(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    const formattedRecentOrders = recentOrders?.map(order => ({
      ...order,
      store_name: order.stores?.name,
      stores: undefined,
    }));

    // Recent reservations
    const { data: recentReservations } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Order status breakdown for today
    const { data: ordersByStatusData } = await supabase
      .from('orders')
      .select('status')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    const statusBreakdown: Record<string, number> = {};
    ordersByStatusData?.forEach(order => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });

    // Reservation status breakdown for today
    const { data: reservationsByStatusData } = await supabase
      .from('reservations')
      .select('status')
      .eq('date', brDate);

    const reservationBreakdown: Record<string, number> = {};
    reservationsByStatusData?.forEach(res => {
      reservationBreakdown[res.status] = (reservationBreakdown[res.status] || 0) + 1;
    });

    // Revenue by store
    const { data: stores } = await supabase
      .from('stores')
      .select('id, name')
      .eq('active', true);

    const { data: ordersByStore } = await supabase
      .from('orders')
      .select('store_id, total')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .neq('status', 'cancelled');

    const revenueByStore = stores?.map(store => {
      const storeOrders = ordersByStore?.filter(o => o.store_id === store.id) || [];
      const revenue = storeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      return {
        store_id: store.id,
        store_name: store.name,
        revenue,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      orders_today: ordersToday || 0,
      pending_orders: pendingOrders || 0,
      reservations_today: reservationsToday || 0,
      revenue_today: revenueToday,
      recent_orders: formattedRecentOrders || [],
      recent_reservations: recentReservations || [],
      revenue_by_store: revenueByStore || [],
      orders_by_status: statusBreakdown,
      reservations_by_status: reservationBreakdown,
    });
  } catch (error) {
    console.error('[v0] Dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
