'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Order = {
  id: number;
  status: string;
  created_at: string;
};

type Reservation = {
  id: number;
  date: string;
  status: string;
};

export default function StoreDashboardPage() {
  const router = useRouter();
  const [, setStoreId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState('');
  const [todayOrders, setTodayOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [todayReservations, setTodayReservations] = useState(0);
  const [loading, setLoading] = useState(true);

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
        setStoreName(me.store_name);

        const today = new Date().toISOString().split('T')[0];

        const [ordersRes, reservationsRes] = await Promise.all([
          fetch(`/api/orders?store_id=${me.store_id}`),
          fetch(`/api/reservations?store_id=${me.store_id}&date=${today}`),
        ]);

        if (ordersRes.ok) {
          const orders: Order[] = await ordersRes.json();
          const todayStr = today;
          const todayOrdersList = orders.filter((o) => o.created_at.startsWith(todayStr));
          setTodayOrders(todayOrdersList.length);
          setPendingOrders(
            orders.filter(
              (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing',
            ).length,
          );
        }

        if (reservationsRes.ok) {
          const reservations: Reservation[] = await reservationsRes.json();
          setTodayReservations(reservations.length);
        }
      } catch {
        router.push('/loja/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Painel da Loja</h1>
      <p className="text-gray-400 mb-8">{storeName}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

        {/* Today's Reservations */}
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
    </div>
  );
}
