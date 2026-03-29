'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type DashboardStats = {
  totalOrdersToday: number;
  pendingOrders: number;
  reservationsToday: number;
  revenueToday: number;
};

type RecentOrder = {
  id: number;
  customer_name: string;
  customer_email: string | null;
  order_type: string;
  status: string;
  total: number;
  created_at: string;
  store_name: string | null;
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

// Used in table column if needed
// const orderTypeLabels: Record<string, string> = { delivery: 'Delivery', pickup: 'Retirada', dine_in: 'No local' };

function LoadingSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-700" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-700" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-gray-800/50 p-6">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-gray-700" />
            <div className="h-9 w-16 animate-pulse rounded bg-gray-700" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
            <div className="mb-4 h-6 w-36 animate-pulse rounded bg-gray-700" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="mb-3 h-10 w-full animate-pulse rounded bg-gray-700/50" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    reservationsToday: 0,
    revenueToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [revenueByStore, setRevenueByStore] = useState<{ store_id: number; store_name: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
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
      setRevenueByStore(data.revenue_by_store || []);
      setLastUpdate(new Date());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    intervalRef.current = setInterval(() => fetchDashboard(), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchDashboard]);

  const statCards = [
    {
      title: 'Total pedidos hoje',
      value: stats.totalOrdersToday,
      color: 'border-blue-500',
      bg: 'bg-blue-600/10',
      icon: (
        <svg
          className="h-5 w-5 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      title: 'Pedidos pendentes',
      value: stats.pendingOrders,
      color: 'border-yellow-500',
      bg: 'bg-yellow-600/10',
      icon: (
        <svg
          className="h-5 w-5 text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Reservas hoje',
      value: stats.reservationsToday,
      color: 'border-green-500',
      bg: 'bg-green-600/10',
      icon: (
        <svg
          className="h-5 w-5 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: 'Faturamento do dia',
      value: `R$ ${stats.revenueToday.toFixed(2)}`,
      color: 'border-red-500',
      bg: 'bg-red-600/10',
      icon: (
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-600 hover:text-white disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Atualizar
          </button>
        </div>
        {lastUpdate && (
          <span className="text-sm text-gray-500">
            Ultimo update:{' '}
            {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-xl border-l-4 ${card.color} ${card.bg} bg-gray-800/50 p-6`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{card.title}</p>
              {card.icon}
            </div>
            <p className="mt-2 text-xl font-bold text-white sm:text-3xl">{card.value}</p>
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
                    <th className="pb-3 pr-4 hidden lg:table-cell">Loja</th>
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
                      <td className="py-3 pr-4">
                        <div className="text-white">{order.customer_name}</div>
                        {order.customer_email && (
                          <div className="text-xs text-gray-500">{order.customer_email}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-300 hidden lg:table-cell">
                        {order.store_name || '-'}
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

      {/* Revenue by store */}
      {revenueByStore.length > 0 && (
        <div className="mt-6 rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
          <h2 className="mb-4 text-lg font-semibold text-white">Receita por Loja (Hoje)</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {revenueByStore.map((store) => (
              <div
                key={store.store_id}
                className="rounded-xl bg-gray-700/30 border border-gray-700/50 p-4"
              >
                <p className="text-sm text-gray-400 truncate">{store.store_name}</p>
                <p className="text-xl font-bold text-green-400 mt-1">
                  R$ {Number(store.revenue).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-gray-600">Atualiza automaticamente a cada 30s</p>
    </div>
  );
}
