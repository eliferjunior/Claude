'use client';

import { useState, useEffect } from 'react';

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
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  order_type: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
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

const statusTransitions: Record<string, { label: string; next: string; color: string }[]> = {
  pending: [
    { label: 'Confirmar', next: 'confirmed', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Cancelar', next: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
  confirmed: [
    { label: 'Preparando', next: 'preparing', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'Cancelar', next: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
  preparing: [
    { label: 'Pronto', next: 'ready', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Cancelar', next: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
  ready: [{ label: 'Entregue', next: 'delivered', color: 'bg-gray-600 hover:bg-gray-700' }],
};

const sizeLabels: Record<string, string> = {
  small: 'P',
  medium: 'M',
  large: 'G',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const query = filterStatus ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/orders${query}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(orderId: number) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }

    // Fetch order details with items
    try {
      const res = await fetch(`/api/orders?id=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, items: data.items || [] } : o)),
        );
      }
    } catch {
      // silently fail
    }
    setExpandedId(orderId);
  }

  async function updateStatus(orderId: number, newStatus: string) {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">Nenhum pedido encontrado</p>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800 text-left text-gray-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <>
                  <tr
                    key={order.id}
                    onClick={() => toggleExpand(order.id)}
                    className={`cursor-pointer border-b border-gray-700/50 transition-colors hover:bg-gray-700/40 ${
                      idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-300">#{order.id}</td>
                    <td className="px-4 py-3 text-white">{order.customer_name}</td>
                    <td className="px-4 py-3 text-gray-300">{order.customer_phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {orderTypeLabels[order.order_type] || order.order_type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[order.status] || ''
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">R$ {order.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                        {(statusTransitions[order.status] || []).map((action) => (
                          <button
                            key={action.next}
                            onClick={() => updateStatus(order.id, action.next)}
                            className={`rounded px-2 py-1 text-xs font-medium text-white ${action.color}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-gray-800/60">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 font-semibold text-white">Itens do pedido</h4>
                            {order.items && order.items.length > 0 ? (
                              <ul className="space-y-1">
                                {order.items.map((item) => (
                                  <li key={item.id} className="flex justify-between text-gray-300">
                                    <span>
                                      {item.quantity}x {item.product_name}
                                      {item.size ? ` (${sizeLabels[item.size] || item.size})` : ''}
                                    </span>
                                    <span>R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">Carregando itens...</p>
                            )}
                          </div>
                          <div>
                            {order.customer_address && (
                              <p className="mb-1 text-gray-300">
                                <span className="font-medium text-gray-400">Endereco:</span>{' '}
                                {order.customer_address}
                              </p>
                            )}
                            {order.notes && (
                              <p className="text-gray-300">
                                <span className="font-medium text-gray-400">Observacoes:</span>{' '}
                                {order.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
