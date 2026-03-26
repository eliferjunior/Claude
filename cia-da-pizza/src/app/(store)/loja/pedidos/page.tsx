'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/store/me');
      if (!meRes.ok) {
        router.push('/loja/login');
        return;
      }
      const me = await meRes.json();
      setStoreId(me.store_id);
    }
    init();
  }, [router]);

  useEffect(() => {
    if (!storeId) return;
    fetchOrders();
  }, [storeId, filterStatus]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let url = `/api/orders?store_id=${storeId}`;
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  }

  function getNextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
      return STATUS_FLOW[idx + 1];
    }
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Pedidos</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            return (
              <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">Pedido #{order.id}</h3>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] || ''}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                        {ORDER_TYPE_LABELS[order.order_type] || order.order_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {order.customer_name}
                      {order.customer_phone && ` - ${order.customer_phone}`}
                    </p>
                    {order.customer_address && (
                      <p className="text-sm text-gray-500 mt-0.5">{order.customer_address}</p>
                    )}
                    {order.notes && (
                      <p className="text-sm text-gray-500 mt-0.5 italic">Obs: {order.notes}</p>
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
                      {STATUS_LABELS[nextStatus]
                        ? `Marcar como ${STATUS_LABELS[nextStatus]}`
                        : nextStatus}
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
