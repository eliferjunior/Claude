'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

type OrderItem = {
  id: number;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  notes: string | null;
};

type Order = {
  id: number;
  store_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  order_type: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-700',
  confirmed: 'bg-blue-600/20 text-blue-400 border-blue-700',
  preparing: 'bg-orange-600/20 text-orange-400 border-orange-700',
  ready: 'bg-green-600/20 text-green-400 border-green-700',
  delivered: 'bg-gray-600/20 text-gray-400 border-gray-700',
  cancelled: 'bg-red-600/20 text-red-400 border-red-700',
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  dine_in: 'No Local',
};

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export default function StorePedidosPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const storeIdRef = useRef<number | null>(null);
  const filterRef = useRef('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async (sid: number | null, isManual = false) => {
    const id = sid ?? storeIdRef.current;
    if (!id) return;
    if (isManual) setRefreshing(true);
    try {
      let url = `/api/orders?store_id=${id}`;
      if (filterRef.current) url += `&status=${filterRef.current}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch {
      // Ignore network errors on auto-refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/store/me');
      if (!meRes.ok) {
        router.push('/loja/login');
        return;
      }
      const me = await meRes.json();
      setStoreId(me.store_id);
      storeIdRef.current = me.store_id;
      await fetchOrders(me.store_id);
    }
    init();
  }, [router, fetchOrders]);

  useEffect(() => {
    filterRef.current = filterStatus;
    fetchOrders(null);
  }, [filterStatus, fetchOrders]);

  useEffect(() => {
    if (!storeId) return;
    intervalRef.current = setInterval(() => fetchOrders(storeId), 20000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storeId, fetchOrders]);

  async function updateStatus(orderId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        setMessage({ type: 'success', text: `Pedido #${orderId} atualizado para ${STATUS_LABELS[newStatus]}` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar pedido.' });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
      setTimeout(() => setMessage(null), 4000);
    }
  }

  async function fetchOrderItems(orderId: number) {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, items: data.items || [] } : o)),
        );
        setExpandedOrder(orderId);
      }
    } catch {
      // ignore
    }
  }

  function getNextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1];
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <button
          onClick={() => fetchOrders(storeId, true)}
          disabled={refreshing}
          aria-label="Atualizar lista de pedidos"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-600/20 text-green-400 border border-green-700'
              : 'bg-red-600/20 text-red-400 border border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === ''
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Todos
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-400 text-center py-12">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">Pedido #{order.id}</h3>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] || ''}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                          {ORDER_TYPE_LABELS[order.order_type] || order.order_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {order.customer_name}
                        {order.customer_phone && (
                          <a href={`tel:${order.customer_phone}`} className="ml-2 text-red-400 hover:underline">
                            {order.customer_phone}
                          </a>
                        )}
                      </p>
                      {order.customer_address && (
                        <p className="text-sm text-gray-500 mt-0.5">{order.customer_address}</p>
                      )}
                      {order.notes && (
                        <p className="text-sm text-amber-400 mt-0.5 italic">Obs: {order.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Marcar como {STATUS_LABELS[nextStatus]}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-red-400 text-sm font-medium hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => fetchOrderItems(order.id)}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      {isExpanded ? 'Ocultar itens' : 'Ver itens'}
                    </button>
                  </div>
                </div>

                {isExpanded && order.items && (
                  <div className="border-t border-gray-800 bg-gray-900/50 px-5 py-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Itens do pedido</p>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-300">
                            {item.quantity}x {item.product_name}
                            {item.size && <span className="text-gray-500"> ({item.size})</span>}
                            {item.notes && <span className="text-amber-400 italic"> - {item.notes}</span>}
                          </span>
                          <span className="text-gray-400 ml-4">
                            R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-gray-600">Atualiza automaticamente a cada 20s</p>
    </div>
  );
}
