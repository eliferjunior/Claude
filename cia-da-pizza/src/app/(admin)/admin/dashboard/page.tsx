'use client';

import { useState, useEffect } from 'react';

type DashboardStats = {
  totalOrdersToday: number;
  pendingOrders: number;
  reservationsToday: number;
  revenueToday: number;
};

type RecentOrder = {
  id: number;
  customer_name: string;
  order_type: string;
  status: string;
  total: number;
  created_at: string;
};

type RecentReservation = {
  id: number;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-600/20 text-yellow-400',
  confirmed: 'bg-blue-600/20 text-blue-400',
  preparing: 'bg-orange-600/20 text-orange-400',
  ready: 'bg-green-600/20 text-green-400',
  delivered: 'bg-gray-600/20 text-gray-400',
  cancelled: 'bg-red-600/20 text-red-400',
};

const orderTypeLabels: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  dine_in: 'No local',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    reservationsToday: 0,
    revenueToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        return;
      }
      const data = await res.json();
      setStats({
        totalOrdersToday: data.orders_today ?? 0,
        pendingOrders: data.pending_orders ?? 0,
        reservationsToday: data.reservations_today ?? 0,
        revenueToday: data.revenue_today ?? 0,
      });
      setRecentOrders(data.recent_orders || []);
      setRecentReservations(data.recent_reservations || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Total pedidos hoje',
      value: stats.totalOrdersToday,
      color: 'border-blue-500',
      bg: 'bg-blue-600/10',
    },
    {
      title: 'Pedidos pendentes',
      value: stats.pendingOrders,
      color: 'border-yellow-500',
      bg: 'bg-yellow-600/10',
    },
    {
      title: 'Reservas hoje',
      value: stats.reservationsToday,
      color: 'border-green-500',
      bg: 'bg-green-600/10',
    },
    {
      title: 'Faturamento do dia',
      value: `R$ ${stats.revenueToday.toFixed(2)}`,
      color: 'border-red-500',
      bg: 'bg-red-600/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-xl border-l-4 ${card.color} ${card.bg} bg-gray-800/50 p-6`}
          >
            <p className="text-sm text-gray-400">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
          <h2 className="mb-4 text-lg font-semibold text-white">Pedidos recentes</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400">Nenhum pedido recente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Cliente</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-700/50 ${
                        idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20'
                      }`}
                    >
                      <td className="py-3 pr-4 text-gray-300">{order.id}</td>
                      <td className="py-3 pr-4 text-white">{order.customer_name}</td>
                      <td className="py-3 pr-4 text-gray-300">
                        {orderTypeLabels[order.order_type] || order.order_type}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            statusColors[order.status] || ''
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-white">R$ {order.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent reservations */}
        <div className="rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
          <h2 className="mb-4 text-lg font-semibold text-white">Reservas recentes</h2>
          {recentReservations.length === 0 ? (
            <p className="text-gray-400">Nenhuma reserva recente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400">
                    <th className="pb-3 pr-4">Cliente</th>
                    <th className="pb-3 pr-4">Data</th>
                    <th className="pb-3 pr-4">Hora</th>
                    <th className="pb-3 pr-4">Pessoas</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((res, idx) => (
                    <tr
                      key={res.id}
                      className={`border-b border-gray-700/50 ${
                        idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20'
                      }`}
                    >
                      <td className="py-3 pr-4 text-white">{res.customer_name}</td>
                      <td className="py-3 pr-4 text-gray-300">{res.date}</td>
                      <td className="py-3 pr-4 text-gray-300">{res.time}</td>
                      <td className="py-3 pr-4 text-gray-300">{res.guests}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            statusColors[res.status] || ''
                          }`}
                        >
                          {statusLabels[res.status] || res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
