import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const today = new Date().toISOString().split('T')[0];

    const ordersToday = db
      .prepare('SELECT COUNT(*) AS count FROM orders WHERE date(created_at) = ?')
      .get(today) as { count: number };

    const pendingOrders = db
      .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'")
      .get() as { count: number };

    const reservationsToday = db
      .prepare('SELECT COUNT(*) AS count FROM reservations WHERE date = ?')
      .get(today) as { count: number };

    const revenueToday = db
      .prepare(
        "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'",
      )
      .get(today) as { total: number };

    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10').all();

    const recentReservations = db
      .prepare('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5')
      .all();

    return NextResponse.json({
      orders_today: ordersToday.count,
      pending_orders: pendingOrders.count,
      reservations_today: reservationsToday.count,
      revenue_today: revenueToday.total,
      recent_orders: recentOrders,
      recent_reservations: recentReservations,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
