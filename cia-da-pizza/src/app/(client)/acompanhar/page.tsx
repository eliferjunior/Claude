'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type OrderItem = {
  id: number;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  borda: string | null;
  borda_price: number | null;
};

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  order_type: string;
  status: string;
  total: number;
  delivery_fee: number | null;
  payment_method: string | null;
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

const statusDescriptions: Record<string, { delivery: string; pickup: string }> = {
  pending: {
    delivery: 'Seu pedido foi recebido e aguarda confirmacao da loja.',
    pickup: 'Seu pedido foi recebido e aguarda confirmacao da loja.',
  },
  confirmed: {
    delivery: 'A loja confirmou seu pedido! Em breve comecara a preparar.',
    pickup: 'A loja confirmou seu pedido! Em breve comecara a preparar.',
  },
  preparing: {
    delivery: 'Seu pedido esta sendo preparado na cozinha!',
    pickup: 'Seu pedido esta sendo preparado na cozinha!',
  },
  ready: {
    delivery: 'Pedido pronto! Saindo para entrega...',
    pickup: 'Seu pedido esta pronto! Pode vir buscar na loja.',
  },
  delivered: {
    delivery: 'Pedido entregue! Bom apetite!',
    pickup: 'Pedido retirado! Bom apetite!',
  },
};

const statusIcons: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '📦',
  delivered: '🎉',
  cancelled: '❌',
};

const orderTypeLabels: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  dine_in: 'No local',
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartao Credito',
  cartao_debito: 'Cartao Debito',
};

const timelineSteps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function getStepIndex(status: string): number {
  return timelineSteps.indexOf(status);
}

function AcompanharContent() {
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const previousStatus = useRef<string | null>(null);

  // Auto-load from query param
  useEffect(() => {
    const pedidoId = searchParams.get('pedido');
    if (pedidoId) {
      setSearchValue(pedidoId);
      fetchOrder(pedidoId);
    }
  }, []); // Run once on mount

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const sendNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'order-status',
      });
    }
  }, []);

  const fetchOrder = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      setLoading(true);
      setNotFound(false);
      setSearched(true);
      try {
        const res = await fetch(`/api/orders/track?search=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            // Check for status change and notify
            if (previousStatus.current && previousStatus.current !== data.status) {
              const label = statusLabels[data.status] || data.status;
              sendNotification(
                `Pedido #${data.id} - ${label}`,
                statusDescriptions[data.status]?.[
                  data.order_type === 'delivery' ? 'delivery' : 'pickup'
                ] || `Status atualizado para: ${label}`,
              );
            }
            previousStatus.current = data.status;
            setOrder(data);
            setNotFound(false);
          } else {
            setNotFound(true);
            setOrder(null);
          }
        } else {
          setNotFound(true);
          setOrder(null);
        }
      } catch {
        setNotFound(true);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    },
    [sendNotification],
  );

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;
    const interval = setInterval(() => {
      fetchOrder(searchValue);
    }, 15000);
    return () => clearInterval(interval);
  }, [order, searchValue, fetchOrder]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOrder(searchValue);
  }

  const currentStepIndex = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';
  const isDelivered = order?.status === 'delivered';
  const isReady = order?.status === 'ready';
  const isDelivery = order?.order_type === 'delivery';

  return (
    <div className="min-h-screen bg-gray-950 py-8 sm:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Acompanhar Pedido
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Digite o numero do pedido para acompanhar em tempo real
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Numero do pedido"
            className="flex-1 min-w-0 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-base text-white placeholder-gray-500 transition focus:border-red-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !searchValue.trim()}
            className="shrink-0 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {/* Notification prompt */}
        {order &&
          !notificationsEnabled &&
          'Notification' in (typeof window !== 'undefined' ? window : {}) && (
            <button
              onClick={requestNotifications}
              className="mb-6 w-full flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:border-red-500/30 transition-colors"
            >
              <span className="text-xl">🔔</span>
              <div className="text-left">
                <p className="font-medium text-white">Ativar notificacoes</p>
                <p className="text-xs text-gray-500">Receba alertas quando o status mudar</p>
              </div>
            </button>
          )}

        {/* Not Found */}
        {notFound && searched && (
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-8 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-lg text-gray-300 font-medium">Pedido nao encontrado</p>
            <p className="mt-2 text-sm text-gray-500">Verifique o numero e tente novamente.</p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-4">
            {/* Status Hero */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 text-center">
              <span className="text-5xl block mb-3">{statusIcons[order.status] || '📋'}</span>
              <h2 className="text-xl font-bold text-white mb-1">Pedido #{order.id}</h2>
              <span
                className={`inline-block text-sm font-semibold px-4 py-1 rounded-full ${
                  isCancelled
                    ? 'bg-red-600/20 text-red-400'
                    : isDelivered
                      ? 'bg-green-600/20 text-green-400'
                      : isReady
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-yellow-600/20 text-yellow-400'
                }`}
              >
                {statusLabels[order.status] || order.status}
              </span>

              {/* Status description */}
              {!isCancelled && statusDescriptions[order.status] && (
                <p className="mt-3 text-sm text-gray-400">
                  {isDelivery
                    ? statusDescriptions[order.status].delivery
                    : statusDescriptions[order.status].pickup}
                </p>
              )}

              {/* Ready to pickup alert */}
              {isReady && !isDelivery && (
                <div className="mt-4 bg-blue-600/10 border border-blue-500/30 rounded-lg px-4 py-3">
                  <p className="text-blue-400 font-bold text-base">
                    Seu pedido esta pronto para retirada!
                  </p>
                  {order.store_name && (
                    <p className="text-blue-300/70 text-sm mt-1">Retire na {order.store_name}</p>
                  )}
                </div>
              )}

              {/* Ready for delivery alert */}
              {isReady && isDelivery && (
                <div className="mt-4 bg-green-600/10 border border-green-500/30 rounded-lg px-4 py-3">
                  <p className="text-green-400 font-bold text-base">Pedido a caminho!</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            {!isCancelled && (
              <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                <div className="flex items-center justify-between">
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const isLast = idx === timelineSteps.length - 1;
                    return (
                      <div key={step} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-red-600 text-white ring-4 ring-red-600/30'
                                : isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-800 text-gray-500 border border-gray-700'
                            }`}
                          >
                            {isCompleted ? (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span
                            className={`mt-1.5 text-center text-[10px] leading-tight sm:text-xs ${
                              isCurrent
                                ? 'font-bold text-red-400'
                                : isCompleted
                                  ? 'font-medium text-green-400'
                                  : 'text-gray-600'
                            }`}
                          >
                            {statusLabels[step]}
                          </span>
                        </div>
                        {!isLast && (
                          <div
                            className={`mx-1 h-0.5 flex-1 rounded ${
                              idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-800'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled */}
            {isCancelled && (
              <div className="rounded-xl bg-red-900/20 border border-red-800/40 p-6 text-center">
                <p className="text-lg font-bold text-red-400">Este pedido foi cancelado</p>
                <p className="text-sm text-gray-500 mt-2">
                  Entre em contato com a loja se tiver duvidas.
                </p>
              </div>
            )}

            {/* Order Info */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Detalhes
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo</span>
                  <span className="text-white font-medium">
                    {orderTypeLabels[order.order_type] || order.order_type}
                  </span>
                </div>
                {order.store_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loja</span>
                    <span className="text-white font-medium">{order.store_name}</span>
                  </div>
                )}
                {order.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pagamento</span>
                    <span className="text-white font-medium">
                      {paymentLabels[order.payment_method] || order.payment_method}
                    </span>
                  </div>
                )}
                {order.customer_address && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400 shrink-0">Endereco</span>
                    <span className="text-white font-medium text-right">
                      {order.customer_address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Pedido em</span>
                  <span className="text-white font-medium">
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Items List */}
            {order.items && order.items.length > 0 && (
              <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Itens
                </h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <span className="text-white">
                          {item.quantity}x {item.product_name}
                          {item.size && <span className="text-gray-500"> ({item.size})</span>}
                        </span>
                        {item.borda && (
                          <span className="block text-xs text-purple-400">Borda: {item.borda}</span>
                        )}
                      </div>
                      <span className="text-gray-300 ml-3 shrink-0">
                        R${' '}
                        {((item.unit_price + (item.borda_price ?? 0)) * item.quantity)
                          .toFixed(2)
                          .replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-800 space-y-1">
                  {order.delivery_fee && order.delivery_fee > 0 && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Taxa de entrega</span>
                      <span>R$ {order.delivery_fee.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-red-400">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* New Order button */}
            {(isDelivered || isCancelled) && (
              <div className="text-center pt-2">
                <Link
                  href="/pedido"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 font-semibold text-white transition-all duration-300"
                >
                  Fazer Novo Pedido
                </Link>
              </div>
            )}

            {/* Auto-refresh */}
            {!isDelivered && !isCancelled && (
              <p className="text-center text-xs text-gray-600">
                Atualiza automaticamente a cada 15 segundos
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcompanharPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
          Carregando...
        </div>
      }
    >
      <AcompanharContent />
    </Suspense>
  );
}
