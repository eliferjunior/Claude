'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

type DashboardStats = {
  totalOrdersToday: number;
  pendingOrders: number;
  reservationsToday: number;
  revenueToday: number;
  activeStores: number;
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

const orderTypeLabels: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  dine_in: 'Mesa',
};

const navCards = [
  {
    title: 'Pedidos',
    description: 'Gerenciar pedidos e acompanhar status',
    href: '/admin/pedidos',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/20',
    ring: 'ring-blue-500/20',
  },
  {
    title: 'Lojas',
    description: 'Administrar unidades e horarios',
    href: '/admin/lojas',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    hoverBg: 'hover:bg-green-500/20',
    ring: 'ring-green-500/20',
  },
  {
    title: 'Produtos',
    description: 'Cardapio, precos e disponibilidade',
    href: '/admin/produtos',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    hoverBg: 'hover:bg-orange-500/20',
    ring: 'ring-orange-500/20',
  },
  {
    title: 'Categorias',
    description: 'Organizar produtos por categoria',
    href: '/admin/categorias',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    hoverBg: 'hover:bg-purple-500/20',
    ring: 'ring-purple-500/20',
  },
  {
    title: 'Reservas',
    description: 'Visualizar e gerenciar reservas',
    href: '/admin/reservas',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    hoverBg: 'hover:bg-cyan-500/20',
    ring: 'ring-cyan-500/20',
  },
  {
    title: 'Promocoes',
    description: 'Criar e gerenciar promocoes',
    href: '/admin/promocoes',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
        />
      </svg>
    ),
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    hoverBg: 'hover:bg-pink-500/20',
    ring: 'ring-pink-500/20',
  },
  {
    title: 'Usuarios',
    description: 'Gerenciar administradores',
    href: '/admin/usuarios',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    hoverBg: 'hover:bg-indigo-500/20',
    ring: 'ring-indigo-500/20',
  },
  {
    title: 'Configuracoes',
    description: 'Taxa de entrega e preferencias',
    href: '/admin/configuracoes',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    hoverBg: 'hover:bg-gray-500/20',
    ring: 'ring-gray-500/20',
  },
];

function LoadingSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-800/80 p-6">
        <div className="h-7 w-56 animate-pulse rounded-lg bg-gray-700" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-700" />
      </div>
      {/* Stat cards skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl bg-gray-800/60 p-5">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-gray-700" />
            <div className="h-8 w-16 animate-pulse rounded bg-gray-700" />
          </div>
        ))}
      </div>
      {/* Nav grid skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-xl bg-gray-800/60 p-5">
            <div className="mb-3 h-7 w-7 animate-pulse rounded bg-gray-700" />
            <div className="h-5 w-20 animate-pulse rounded bg-gray-700" />
            <div className="mt-1 h-3 w-32 animate-pulse rounded bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    reservationsToday: 0,
    revenueToday: 0,
    activeStores: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [revenueByStore, setRevenueByStore] = useState<
    { store_id: number; store_name: string; revenue: number }[]
  >([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [reservationsByStatus, setReservationsByStatus] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [dashRes, storesRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/stores?active=1'),
      ]);

      if (!dashRes.ok) {
        if (dashRes.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        return;
      }

      const data = await dashRes.json();
      const stores = storesRes.ok ? await storesRes.json() : [];

      setStats({
        totalOrdersToday: data.orders_today ?? 0,
        pendingOrders: data.pending_orders ?? 0,
        reservationsToday: data.reservations_today ?? 0,
        revenueToday: data.revenue_today ?? 0,
        activeStores: Array.isArray(stores) ? stores.length : 0,
      });
      setRecentOrders(data.recent_orders || []);
      setRecentReservations(data.recent_reservations || []);
      setRevenueByStore(data.revenue_by_store || []);
      setOrdersByStatus(data.orders_by_status || {});
      setReservationsByStatus(data.reservations_by_status || {});
      setLastUpdate(new Date());
    } catch {
      if (isManual) {
        alert('Erro ao atualizar dados. Verifique sua conexao.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) setAdminName(data.user.name);
      })
      .catch(() => {});
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
      title: 'Total Pedidos Hoje',
      value: stats.totalOrdersToday,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
      border: 'border-blue-500/30',
    },
    {
      title: 'Faturamento Hoje',
      value: formatCurrency(stats.revenueToday),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/15',
      border: 'border-yellow-500/30',
      highlight: stats.pendingOrders > 0,
    },
    {
      title: 'Reservas Hoje',
      value: stats.reservationsToday,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15',
      border: 'border-cyan-500/30',
    },
    {
      title: 'Lojas Ativas',
      value: stats.activeStores,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/15',
      border: 'border-green-500/30',
    },
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="rounded-2xl bg-gradient-to-r from-red-900/40 via-gray-800/80 to-gray-800/60 p-6 ring-1 ring-red-900/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Painel Administrativo</h1>
            <p className="mt-1 text-sm text-gray-400">
              {adminName ? `Bem-vindo, ${adminName}` : 'Bem-vindo'} — Visao geral do seu negocio
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Atualizado as{' '}
                {lastUpdate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              aria-label="Atualizar dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-xl border ${card.border} bg-gray-800/50 p-5 transition-all hover:bg-gray-800/70 ${
              card.highlight ? 'ring-2 ring-yellow-500/30' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {card.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`rounded-lg ${card.iconBg} p-2.5 ${card.iconColor}`}>{card.icon}</div>
            </div>
            {card.highlight && (
              <div className="mt-2 flex items-center gap-1">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                <span className="text-xs text-yellow-400">Requer atencao</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Acesso Rapido
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {navCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-xl ${card.bg} p-4 ring-1 ${card.ring} transition-all duration-200 ${card.hoverBg} hover:ring-2 hover:shadow-lg`}
            >
              <div className={`${card.color} mb-3 transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
              <h3 className="font-semibold text-white">{card.title}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="rounded-xl bg-gray-800/50 p-5 ring-1 ring-gray-700/50">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Pedidos por Status (Hoje)
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { key: 'pending', label: 'Pendentes', color: 'yellow' },
            { key: 'confirmed', label: 'Confirmados', color: 'blue' },
            { key: 'preparing', label: 'Preparando', color: 'orange' },
            { key: 'ready', label: 'Prontos', color: 'green' },
            { key: 'delivered', label: 'Entregues', color: 'gray' },
            { key: 'cancelled', label: 'Cancelados', color: 'red' },
          ].map((item) => (
            <div
              key={item.key}
              className={`rounded-lg bg-${item.color}-600/10 border border-${item.color}-600/20 p-3 text-center`}
            >
              <p className={`text-2xl font-bold text-${item.color}-400`}>
                {ordersByStatus[item.key] || 0}
              </p>
              <p className={`mt-0.5 text-xs font-medium text-${item.color}-400/80`}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Status */}
      <div className="rounded-xl bg-gray-800/50 p-5 ring-1 ring-gray-700/50">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Reservas por Status (Hoje)
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-yellow-600/10 border border-yellow-600/20 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {reservationsByStatus['pending'] || 0}
            </p>
            <p className="mt-0.5 text-xs font-medium text-yellow-400/80">Pendentes</p>
          </div>
          <div className="rounded-lg bg-green-600/10 border border-green-600/20 p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              {reservationsByStatus['confirmed'] || 0}
            </p>
            <p className="mt-0.5 text-xs font-medium text-green-400/80">Confirmadas</p>
          </div>
          <div className="rounded-lg bg-red-600/10 border border-red-600/20 p-3 text-center">
            <p className="text-2xl font-bold text-red-400">
              {reservationsByStatus['cancelled'] || 0}
            </p>
            <p className="mt-0.5 text-xs font-medium text-red-400/80">Canceladas</p>
          </div>
        </div>
      </div>

      {/* Recent Orders & Reservations */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl bg-gray-800/50 p-5 ring-1 ring-gray-700/50">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Pedidos Recentes
            </h2>
            <Link
              href="/admin/pedidos"
              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg
                className="mb-2 h-10 w-10 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm">Nenhum pedido recente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-700/20 p-3 transition-colors hover:bg-gray-700/30"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700/50 text-xs font-bold text-gray-400">
                    #{order.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {order.store_name || 'Sem loja'}{' '}
                      {order.order_type
                        ? `- ${orderTypeLabels[order.order_type] || order.order_type}`
                        : ''}
                      {order.created_at ? ` - ${formatTime(order.created_at)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(order.total)}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        statusColors[order.status] || 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reservations */}
        <div className="rounded-xl bg-gray-800/50 p-5 ring-1 ring-gray-700/50">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Reservas Recentes
            </h2>
            <Link
              href="/admin/reservas"
              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              Ver todas
            </Link>
          </div>
          {recentReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg
                className="mb-2 h-10 w-10 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Nenhuma reserva recente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-700/20 p-3 transition-colors hover:bg-gray-700/30"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700/50">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{res.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {res.date} as {res.time} - {res.guests}{' '}
                      {res.guests === 1 ? 'pessoa' : 'pessoas'}
                    </p>
                  </div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      statusColors[res.status] || 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {statusLabels[res.status] || res.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Store */}
      {revenueByStore.length > 0 && (
        <div className="rounded-xl bg-gray-800/50 p-5 ring-1 ring-gray-700/50">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Receita por Loja (Hoje)
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {revenueByStore.map((store) => (
              <div
                key={store.store_id}
                className="rounded-lg border border-gray-700/50 bg-gray-700/20 p-4 transition-colors hover:bg-gray-700/30"
              >
                <p className="truncate text-sm text-gray-400">{store.store_name}</p>
                <p className="mt-1 text-xl font-bold text-emerald-400">
                  {formatCurrency(Number(store.revenue))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs text-gray-600">
        Dados atualizados automaticamente a cada 30 segundos
      </p>
    </div>
  );
}
