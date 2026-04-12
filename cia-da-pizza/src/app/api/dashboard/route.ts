import { NextRequest, NextResponse } from 'next/server';
import { dbRaw, dbRawGet } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const now = new Date();
    const brDate = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

    const ordersToday = await dbRawGet<{ count: number }>(
      'SELECT COUNT(*) AS count FROM orders WHERE date(created_at) = ?',
      [brDate],
    );

    const pendingOrders = await dbRawGet<{ count: number }>(
      "SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'",
    );

    const reservationsToday = await dbRawGet<{ count: number }>(
      'SELECT COUNT(*) AS count FROM reservations WHERE date = ?',
      [brDate],
    );

    const revenueToday = await dbRawGet<{ total: number }>(
      "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'",
      [brDate],
    );

    const recentOrders = await dbRaw(
      `SELECT o.*, s.name AS store_name
       FROM orders o
       LEFT JOIN stores s ON o.store_id = s.id
       ORDER BY o.created_at DESC
       LIMIT 10`,
    );

    const recentReservations = await dbRaw(
      'SELECT * FROM reservations ORDER BY created_at DESC LIMIT 5',
    );

    const ordersByStatus = await dbRaw<{ status: string; count: number }>(
      `SELECT status, COUNT(*) AS count
       FROM orders
       WHERE date(created_at) = ?
       GROUP BY status`,
      [brDate],
    );

    const statusBreakdown: Record<string, number> = {};
    for (const row of ordersByStatus) {
      statusBreakdown[row.status] = row.count;
    }

    const reservationsByStatus = await dbRaw<{ status: string; count: number }>(
      `SELECT status, COUNT(*) AS count
       FROM reservations
       WHERE date = ?
       GROUP BY status`,
      [brDate],
    );

    const reservationBreakdown: Record<string, number> = {};
    for (const row of reservationsByStatus) {
      reservationBreakdown[row.status] = row.count;
    }

    const revenueByStore = await dbRaw(
      `SELECT s.id AS store_id, s.name AS store_name, COALESCE(SUM(o.total), 0) AS revenue
       FROM stores s
       LEFT JOIN orders o ON o.store_id = s.id
         AND date(o.created_at) = ?
         AND o.status != 'cancelled'
       WHERE s.active = 1
       GROUP BY s.id, s.name
       ORDER BY revenue DESC`,
      [brDate],
    );

    return NextResponse.json({
      orders_today: ordersToday?.count || 0,
      pending_orders: pendingOrders?.count || 0,
      reservations_today: reservationsToday?.count || 0,
      revenue_today: revenueToday?.total || 0,
      recent_orders: recentOrders,
      recent_reservations: recentReservations,
      revenue_by_store: revenueByStore,
      orders_by_status: statusBreakdown,
      reservations_by_status: reservationBreakdown,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
