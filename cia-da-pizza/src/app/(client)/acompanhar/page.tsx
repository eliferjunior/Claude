'use client';

import { useState, useEffect, useCallback } from 'react';

type OrderItem = {
  id: number;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
};

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string | null;
  order_type: string;
  status: string;
  total: number;
  store_name?: string;
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

const orderTypeLabels: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  dine_in: 'No local',
};

const sizeLabels: Record<string, string> = {
  small: 'P',
  medium: 'M',
  large: 'G',
};

const timelineSteps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function getStepIndex(status: string): number {
  const idx = timelineSteps.indexOf(status);
  return idx >= 0 ? idx : -1;
}

export default function AcompanharPage() {
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(value.trim())}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.orders ? data.orders[0] : Array.isArray(data) ? data[0] : data;
        if (found && found.id) {
          setOrder(found);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!order) return;
    const interval = setInterval(() => {
      fetchOrder(searchValue);
    }, 30000);
    return () => clearInterval(interval);
  }, [order, searchValue, fetchOrder]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOrder(searchValue);
  }

  const currentStepIndex = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-900 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Acompanhar Pedido</h1>
          <p className="mt-3 text-lg text-gray-400">
            Digite o numero do pedido ou telefone para acompanhar
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mx-auto mb-10 flex max-w-lg gap-3">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Numero do pedido ou telefone"
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={loading || !searchValue.trim()}
            className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Not Found */}
        {notFound && searched && (
          <div className="rounded-xl bg-gray-800 p-8 text-center">
            <p className="text-lg text-gray-400">Pedido nao encontrado</p>
            <p className="mt-2 text-sm text-gray-500">
              Verifique o numero do pedido ou telefone e tente novamente.
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="rounded-xl bg-gray-800 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-white">Pedido #{order.id}</h2>
                {isCancelled ? (
                  <span className="rounded-full bg-red-600/20 px-3 py-1 text-sm font-medium text-red-400">
                    Cancelado
                  </span>
                ) : (
                  <span className="rounded-full bg-green-600/20 px-3 py-1 text-sm font-medium text-green-400">
                    {statusLabels[order.status] || order.status}
                  </span>
                )}
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-gray-400">Data: </span>
                  <span className="text-white">
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                {order.store_name && (
                  <div>
                    <span className="text-gray-400">Loja: </span>
                    <span className="text-white">{order.store_name}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Tipo: </span>
                  <span className="text-white">
                    {orderTypeLabels[order.order_type] || order.order_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {!isCancelled && (
              <div className="rounded-xl bg-gray-800 p-6">
                <h3 className="mb-6 text-lg font-semibold text-white">Status do Pedido</h3>
                <div className="flex items-center justify-between">
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isLast = idx === timelineSteps.length - 1;
                    return (
                      <div key={step} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold sm:h-10 sm:w-10 ${
                              isCompleted ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
                            }`}
                          >
                            {isCompleted ? (
                              <svg
                                className="h-4 w-4 sm:h-5 sm:w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span
                            className={`mt-2 text-center text-xs sm:text-sm ${
                              isCompleted ? 'font-medium text-green-400' : 'text-gray-500'
                            }`}
                          >
                            {statusLabels[step]}
                          </span>
                        </div>
                        {!isLast && (
                          <div
                            className={`mx-1 h-1 flex-1 rounded sm:mx-2 ${
                              idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-600'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled Badge */}
            {isCancelled && (
              <div className="rounded-xl bg-red-900/30 p-6 text-center">
                <span className="text-lg font-bold text-red-400">Este pedido foi cancelado</span>
              </div>
            )}

            {/* Items List */}
            {order.items && order.items.length > 0 && (
              <div className="rounded-xl bg-gray-800 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Itens do Pedido</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3"
                    >
                      <div>
                        <span className="font-medium text-white">{item.product_name}</span>
                        {item.size && (
                          <span className="ml-2 text-sm text-gray-400">
                            ({sizeLabels[item.size] || item.size})
                          </span>
                        )}
                        <span className="ml-2 text-sm text-gray-400">x{item.quantity}</span>
                      </div>
                      <span className="font-medium text-white">
                        R$ {(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-gray-700 pt-4">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-lg font-bold text-green-400">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Auto-refresh notice */}
            <p className="text-center text-xs text-gray-500">
              Esta pagina atualiza automaticamente a cada 30 segundos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
