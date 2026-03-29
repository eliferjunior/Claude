'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { generateWhatsAppStatusLink } from '@/lib/notifications';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOrderBanner, setNewOrderBanner] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevOrderCountRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (searchTerm) params.set('search', searchTerm);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/orders${query}`);
      if (res.ok) {
        const data = await res.json();
        const newOrders: Order[] = data.orders || data;
        const newCount = newOrders.length;

        // Check for new orders (only after initial load)
        if (prevOrderCountRef.current !== null && newCount > prevOrderCountRef.current) {
          setNewOrderBanner(true);
          if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
          bannerTimeoutRef.current = setTimeout(() => setNewOrderBanner(false), 8000);

          if (soundEnabled) {
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 800;
              gain.gain.value = 0.3;
              osc.start();
              osc.stop(ctx.currentTime + 0.2);
              setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 1000;
                gain2.gain.value = 0.3;
                osc2.start();
                osc2.stop(ctx.currentTime + 0.2);
              }, 250);
            } catch {
              // audio not available
            }
          }
        }
        prevOrderCountRef.current = newCount;
        setOrders(newOrders);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, dateFrom, dateTo, soundEnabled]);

  useEffect(() => {
    prevOrderCountRef.current = null;
    setLoading(true);
    fetchOrders();
  }, [filterStatus, searchTerm, dateFrom, dateTo, fetchOrders]);

  useEffect(() => {
    intervalRef.current = setInterval(fetchOrders, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    };
  }, []);

  async function toggleExpand(orderId: number) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }

    // Fetch order details with items
    try {
      const res = await fetch(`/api/orders/${orderId}`);
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
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

        // Oferecer notificar cliente via WhatsApp
        const order = orders.find((o) => o.id === orderId);
        if (order?.customer_phone) {
          const whatsLink = generateWhatsAppStatusLink(
            order.customer_phone,
            orderId,
            newStatus as
              | 'pending'
              | 'confirmed'
              | 'preparing'
              | 'ready'
              | 'delivered'
              | 'cancelled',
          );
          const statusLabels: Record<string, string> = {
            confirmed: 'Confirmado',
            preparing: 'Em Preparo',
            ready: 'Pronto',
            delivered: 'Entregue',
          };
          if (
            statusLabels[newStatus] &&
            confirm(
              `Notificar cliente via WhatsApp que o pedido esta "${statusLabels[newStatus]}"?`,
            )
          ) {
            window.open(whatsLink, '_blank');
          }
        }
      }
    } catch {
      // silently fail
    }
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div>
      {/* New order notification banner */}
      {newOrderBanner && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-green-600/20 border border-green-500/30 px-4 py-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/30">
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-300">Novo pedido recebido!</span>
          </div>
          <button
            onClick={() => setNewOrderBanner(false)}
            className="text-green-400 hover:text-green-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-600/20 px-3 py-1 text-xs font-medium text-yellow-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Desativar som' : 'Ativar som de notificacao'}
            className={`rounded-lg p-2 transition-colors ${
              soundEnabled
                ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                : 'bg-gray-700 text-gray-500 hover:bg-gray-600 hover:text-gray-300'
            }`}
          >
            {soundEnabled ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
                <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
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

      {/* Search and date filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-gray-800/50" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">Nenhum pedido encontrado</p>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => toggleExpand(order.id)}
                className="cursor-pointer rounded-xl bg-gray-800/50 p-4 ring-1 ring-gray-700"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">#{order.id}</span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[order.status] || ''
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white">{order.customer_name}</p>
                    {order.customer_phone && (
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">R$ {order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {orderTypeLabels[order.order_type] || order.order_type}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleString('pt-BR')}
                </p>
                <div className="mt-2 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                  {(statusTransitions[order.status] || []).map((action) => (
                    <button
                      key={action.next}
                      onClick={() => updateStatus(order.id, action.next)}
                      className={`rounded px-3 py-1.5 text-xs font-medium text-white ${action.color}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
                {expandedId === order.id && (
                  <div className="mt-3 border-t border-gray-700 pt-3">
                    <div className="space-y-3">
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-white">Itens do pedido</h4>
                        {order.items && order.items.length > 0 ? (
                          <ul className="space-y-1">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex justify-between text-xs text-gray-300"
                              >
                                <span>
                                  {item.quantity}x {item.product_name}
                                  {item.size ? ` (${sizeLabels[item.size] || item.size})` : ''}
                                </span>
                                <span>R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500">Carregando itens...</p>
                        )}
                      </div>
                      {order.customer_address && (
                        <p className="text-xs text-gray-300">
                          <span className="font-medium text-gray-400">Endereco:</span>{' '}
                          {order.customer_address}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-xs text-gray-300">
                          <span className="font-medium text-gray-400">Observacoes:</span>{' '}
                          {order.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-xl ring-1 ring-gray-700">
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
                  <Fragment key={order.id}>
                    <tr
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
                      <td className="px-4 py-3 text-right text-white">
                        R$ {order.total.toFixed(2)}
                      </td>
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
                                    <li
                                      key={item.id}
                                      className="flex justify-between text-gray-300"
                                    >
                                      <span>
                                        {item.quantity}x {item.product_name}
                                        {item.size
                                          ? ` (${sizeLabels[item.size] || item.size})`
                                          : ''}
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
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="mt-4 text-center text-xs text-gray-600">Atualiza automaticamente a cada 15s</p>
    </div>
  );
}
