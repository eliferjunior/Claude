'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function ConfirmacaoPage() {
  const router = useRouter();
  const { orderType, cart, cartTotal, orderId, customerName, deliveryFee, resetAll } = useCart();

  useEffect(() => {
    if (!orderId) {
      router.replace('/pedido');
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  const isDelivery = orderType === 'delivery';
  const estimatedTime = isDelivery ? '30-45 min' : '15-20 min';

  const handleNewOrder = () => {
    resetAll();
    router.push('/pedido');
  };

  const handleTrack = () => {
    const id = orderId;
    resetAll();
    router.push(`/acompanhar?pedido=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start pt-12 px-4 pb-8">
      {/* Checkmark Animation */}
      <div className="mb-6">
        <div className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center animate-pulse-glow">
          <svg
            className="w-14 h-14 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Pedido Confirmado!</h1>

      {/* Order Number */}
      <p className="text-gray-400 text-lg mb-1">
        Pedido <span className="text-white font-bold">#{orderId}</span>
      </p>

      {/* Customer Name */}
      {customerName && <p className="text-gray-500 text-sm mb-1">{customerName}</p>}

      {/* Estimated Time */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 mb-6 mt-3 flex items-center gap-3">
        <svg
          className="w-5 h-5 text-yellow-400 shrink-0"
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
        <div>
          <p className="text-sm text-gray-400">
            {isDelivery ? 'Previsao de entrega' : 'Previsao para retirada'}
          </p>
          <p className="text-lg font-bold text-yellow-400">{estimatedTime}</p>
        </div>
      </div>

      {/* Status Info */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-sm font-medium text-yellow-400">
            Aguardando confirmacao da loja
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {isDelivery
            ? 'Voce recebera atualizacoes em tempo real na pagina de acompanhamento. Seu pedido sera preparado e enviado para o endereco informado.'
            : 'Voce recebera atualizacoes em tempo real na pagina de acompanhamento. Quando estiver pronto, e so buscar na loja!'}
        </p>
      </div>

      {/* Order Summary */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3 mb-6">
        <h2 className="text-lg font-bold text-red-400 mb-2">Resumo</h2>

        {cart.map((item, index) => (
          <div key={index} className="flex justify-between items-start text-sm">
            <div className="flex-1">
              <span className="text-white">
                {item.quantity}x {item.product_name} ({item.size})
              </span>
              {item.borda && (
                <span className="block text-gray-500 text-xs">
                  Borda: {item.borda} (+{formatPrice(item.borda_price ?? 0)})
                </span>
              )}
            </div>
            <span className="text-gray-300 ml-3">
              {formatPrice((item.unit_price + (item.borda_price ?? 0)) * item.quantity)}
            </span>
          </div>
        ))}

        <div className="border-t border-gray-800 pt-3 space-y-1">
          {isDelivery && deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>Taxa de entrega</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-red-400">{formatPrice(cartTotal)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        {/* Track Order - Primary */}
        <button
          onClick={handleTrack}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Acompanhar Pedido
        </button>

        {/* New Order */}
        <button
          onClick={handleNewOrder}
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          Novo Pedido
        </button>
      </div>
    </div>
  );
}
