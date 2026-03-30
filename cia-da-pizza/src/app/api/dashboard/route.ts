import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    // Use Sao Paulo timezone for proper Brazilian date calculation
    const now = new Date();
    const brDate = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

    const ordersToday = db
      .prepare('SELECT COUNT(*) AS count FROM orders WHERE date(created_at) = ?')
      .get(brDate) as { count: number };

    const pendingOrders = db
      .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'")
      .get() as { count: number };

    const reservationsToday = db
      .prepare('SELECT COUNT(*) AS count FROM reservations WHERE date = ?')
      .get(brDate) as { count: number };

    const revenueToday = db
      .prepare(
        "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'",
      )
      .get(brDate) as { total: number };

    const recentOrders = db
      .prepare(
        `SELECT o.*, s.name AS store_name
         FROM orders o
         LEFT JOIN stores s ON o.store_id = s.id
         ORDER BY o.created_at DESC
         LIMIT 10`,
      )
      .all();

    const recentReservations = db
      .prepare('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5')
      .all();

    // Order status breakdown for today
    const ordersByStatus = db
      .prepare(
        `SELECT status, COUNT(*) AS count
         FROM orders
         WHERE date(created_at) = ?
         GROUP BY status`,
      )
      .all(brDate) as { status: string; count: number }[];

    const statusBreakdown: Record<string, number> = {};
    for (const row of ordersByStatus) {
      statusBreakdown[row.status] = row.count;
    }

    // Reservation status breakdown for today
    const reservationsByStatus = db
      .prepare(
        `SELECT status, COUNT(*) AS count
         FROM reservations
         WHERE date = ?
         GROUP BY status`,
      )
      .all(brDate) as { status: string; count: number }[];

    const reservationBreakdown: Record<string, number> = {};
    for (const row of reservationsByStatus) {
      reservationBreakdown[row.status] = row.count;
    }

    const revenueByStore = db
      .prepare(
        `SELECT s.id AS store_id, s.name AS store_name, COALESCE(SUM(o.total), 0) AS revenue
         FROM stores s
         LEFT JOIN orders o ON o.store_id = s.id
           AND date(o.created_at) = ?
           AND o.status != 'cancelled'
         WHERE s.active = 1
         GROUP BY s.id, s.name
         ORDER BY revenue DESC`,
      )
      .all(brDate);

    return NextResponse.json({
      orders_today: ordersToday.count,
      pending_orders: pendingOrders.count,
      reservations_today: reservationsToday.count,
      revenue_today: revenueToday.total,
      recent_orders: recentOrders,
      recent_reservations: recentReservations,
      revenue_by_store: revenueByStore,
      orders_by_status: statusBreakdown,
      reservations_by_status: reservationBreakdown,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
