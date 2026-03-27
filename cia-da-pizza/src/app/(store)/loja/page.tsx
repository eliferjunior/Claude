'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Order = {
  id: number;
  status: string;
  total: number;
  created_at: string;
};

type Reservation = {
  id: number;
  date: string;
  status: string;
};

function LoadingSkeleton() {
  return (
    <div>
      <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-gray-800" />
      <div className="mb-8 h-5 w-32 animate-pulse rounded bg-gray-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-800" />
              <div>
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-800" />
                <div className="h-9 w-16 animate-pulse rounded bg-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-800" />
    </div>
  );
}

export default function StoreDashboardPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState('');
  const [todayOrders, setTodayOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [todayReservations, setTodayReservations] = useState(0);
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
      const today = new Date().toISOString().split('T')[0];

      const [ordersRes, reservationsRes] = await Promise.all([
        fetch(`/api/orders?store_id=${id}`),
        fetch(`/api/reservations?store_id=${id}&date=${today}`),
      ]);

      if (ordersRes.ok) {
        const orders: Order[] = await ordersRes.json();
        const todayOrdersList = orders.filter((o) => o.created_at.startsWith(today));
        setTodayOrders(todayOrdersList.length);
        setPendingOrders(
          orders.filter(
            (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing',
          ).length,
        );
        const revenue = todayOrdersList
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total || 0), 0);
        setRevenueToday(revenue);
      }

      if (reservationsRes.ok) {
        const reservations: Reservation[] = await reservationsRes.json();
        setTodayReservations(reservations.length);
      }

      setLastUpdate(new Date());
    } catch {
      // silently fail on refresh
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
    intervalRef.current = setInterval(() => fetchData(storeId), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storeId, fetchData]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Painel da Loja</h1>
            <button
              onClick={() => fetchData(storeId, true)}
              disabled={refreshing}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-600/20">
              <svg
                className="h-6 w-6 text-red-500"
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
            </div>
            <div>
              <p className="text-sm text-gray-400">Pedidos Hoje</p>
              <p className="text-3xl font-bold text-white">{todayOrders}</p>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-yellow-600/20">
              <svg
                className="h-6 w-6 text-yellow-500"
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
            </div>
            <div>
              <p className="text-sm text-gray-400">Pedidos Pendentes</p>
              <p className="text-3xl font-bold text-white">{pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-600/20">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Faturamento Hoje</p>
              <p className="text-3xl font-bold text-white">R$ {revenueToday.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Today's Reservations */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600/20">
              <svg
                className="h-6 w-6 text-blue-500"
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
            </div>
            <div>
              <p className="text-sm text-gray-400">Reservas Hoje</p>
              <p className="text-3xl font-bold text-white">{todayReservations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick action */}
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
        Ver Pedidos
      </Link>

      <p className="mt-6 text-center text-xs text-gray-600">Atualiza automaticamente a cada 30s</p>
    </div>
  );
}
