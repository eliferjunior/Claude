'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string | null;
  order_type: string;
  status: string;
  total: number;
  created_at: string;
};

type Reservation = {
  id: number;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
};

const orderTypeLabels: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  dine_in: 'No Local',
};

function LoadingSkeleton() {
  return (
    <div>
      <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-gray-800" />
      <div className="mb-8 h-5 w-32 animate-pulse rounded bg-gray-800" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-800" />
            <div className="h-9 w-16 animate-pulse rounded bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoreDashboardPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const storeIdRef = useRef<number | null>(null);

  const fetchData = useCallback(async (sid: number | null, isManual = false) => {
    const id = sid ?? storeIdRef.current;
    if (!id) return;
    if (isManual) setRefreshing(true);
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

      const [ordersRes, reservationsRes] = await Promise.all([
        fetch(`/api/orders?store_id=${id}`),
        fetch(`/api/reservations?store_id=${id}`),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        const ordersList: Order[] = Array.isArray(data) ? data : data.orders || [];
        // Filter today's orders
        setOrders(ordersList.filter((o) => o.created_at.startsWith(today)));
      }

      if (reservationsRes.ok) {
        const data = await reservationsRes.json();
        const resList: Reservation[] = Array.isArray(data) ? data : data.reservations || [];
        setReservations(resList.filter((r) => r.date === today));
      }

      setLastUpdate(new Date());
    } catch {
      // Network error on auto-refresh
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch('/api/auth/store/me');
        if (!meRes.ok) {
          router.push('/loja/login');
          return;
        }
        const me = await meRes.json();
        setStoreId(me.store_id);
        storeIdRef.current = me.store_id;
        setStoreName(me.store_name);

        await fetchData(me.store_id);
      } catch {
        router.push('/loja/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router, fetchData]);

  useEffect(() => {
    if (!storeId) return;
    intervalRef.current = setInterval(() => fetchData(storeId), 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storeId, fetchData]);

  if (loading) return <LoadingSkeleton />;

  // Calculate stats
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const revenueToday = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingReservations = reservations.filter((r) => r.status === 'pending');
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed');

  const deliveryOrders = orders.filter(
    (o) => o.order_type === 'delivery' && o.status !== 'cancelled',
  );
  const pickupOrders = orders.filter((o) => o.order_type === 'pickup' && o.status !== 'cancelled');
  const dineInOrders = orders.filter((o) => o.order_type === 'dine_in' && o.status !== 'cancelled');

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Painel da Loja</h1>
            <button
              onClick={() => fetchData(storeId, true)}
              disabled={refreshing}
              aria-label="Atualizar dashboard da loja"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
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
          <p className="text-gray-400 mt-1">{storeName}</p>
        </div>
        {lastUpdate && (
          <span className="text-sm text-gray-500">
            Ultimo update:{' '}
            {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Revenue highlight */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Faturamento Hoje</p>
            <p className="text-4xl font-bold text-white mt-1">
              R$ {revenueToday.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total de Pedidos</p>
            <p className="text-4xl font-bold text-white mt-1">{orders.length}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
          <span>Delivery: {deliveryOrders.length}</span>
          <span>Retirada: {pickupOrders.length}</span>
          <span>No Local: {dineInOrders.length}</span>
        </div>
      </div>

      {/* Order Status Quadrants */}
      <h2 className="text-lg font-semibold text-white mb-3">Status dos Pedidos</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {/* Pending */}
        <div className="rounded-xl bg-yellow-600/10 border border-yellow-600/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-400">Pendentes</p>
            <span className="text-2xl font-bold text-yellow-400">{pendingOrders.length}</span>
          </div>
          {pendingOrders.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {pendingOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex justify-between text-xs text-gray-300">
                  <span>
                    #{o.id} {o.customer_name.split(' ')[0]}
                  </span>
                  <span>R$ {o.total.toFixed(2)}</span>
                </div>
              ))}
              {pendingOrders.length > 5 && (
                <p className="text-xs text-gray-500">+{pendingOrders.length - 5} mais</p>
              )}
            </div>
          )}
        </div>

        {/* Confirmed */}
        <div className="rounded-xl bg-blue-600/10 border border-blue-600/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-400">Confirmados</p>
            <span className="text-2xl font-bold text-blue-400">{confirmedOrders.length}</span>
          </div>
          {confirmedOrders.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {confirmedOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex justify-between text-xs text-gray-300">
                  <span>
                    #{o.id} {o.customer_name.split(' ')[0]}
                  </span>
                  <span>{orderTypeLabels[o.order_type] || o.order_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preparing */}
        <div className="rounded-xl bg-orange-600/10 border border-orange-600/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-400">Preparando</p>
            <span className="text-2xl font-bold text-orange-400">{preparingOrders.length}</span>
          </div>
          {preparingOrders.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {preparingOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex justify-between text-xs text-gray-300">
                  <span>
                    #{o.id} {o.customer_name.split(' ')[0]}
                  </span>
                  <span>{orderTypeLabels[o.order_type] || o.order_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ready */}
        <div className="rounded-xl bg-green-600/10 border border-green-600/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-400">Prontos</p>
            <span className="text-2xl font-bold text-green-400">{readyOrders.length}</span>
          </div>
          {readyOrders.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {readyOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex justify-between text-xs text-gray-300">
                  <span>
                    #{o.id} {o.customer_name.split(' ')[0]}
                  </span>
                  <span>{orderTypeLabels[o.order_type] || o.order_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivered */}
        <div className="rounded-xl bg-gray-600/10 border border-gray-600/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Entregues</p>
            <span className="text-2xl font-bold text-gray-400">{deliveredOrders.length}</span>
          </div>
        </div>

        {/* Cancelled */}
        <div className="rounded-xl bg-red-600/10 border border-red-600/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-red-400">Cancelados</p>
            <span className="text-2xl font-bold text-red-400">{cancelledOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Reservations section */}
      <h2 className="text-lg font-semibold text-white mb-3">Reservas de Hoje</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl bg-yellow-600/10 border border-yellow-600/30 p-4">
          <p className="text-sm font-medium text-yellow-400">Aguardando</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{pendingReservations.length}</p>
          {pendingReservations.length > 0 && (
            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
              {pendingReservations.slice(0, 4).map((r) => (
                <div key={r.id} className="flex justify-between text-xs text-gray-300">
                  <span>{r.customer_name.split(' ')[0]}</span>
                  <span>
                    {r.time} - {r.guests}p
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl bg-green-600/10 border border-green-600/30 p-4">
          <p className="text-sm font-medium text-green-400">Confirmadas</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{confirmedReservations.length}</p>
          {confirmedReservations.length > 0 && (
            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
              {confirmedReservations.slice(0, 4).map((r) => (
                <div key={r.id} className="flex justify-between text-xs text-gray-300">
                  <span>{r.customer_name.split(' ')[0]}</span>
                  <span>
                    {r.time} - {r.guests}p
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/loja/pedidos"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Gerenciar Pedidos
        </Link>
        <Link
          href="/loja/reservas"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Gerenciar Reservas
        </Link>
        <Link
          href="/loja/configuracoes"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Configuracoes
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-gray-600">Atualiza automaticamente a cada 15s</p>
    </div>
  );
}
