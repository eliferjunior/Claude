'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { generateWhatsAppOrderLink } from '@/lib/notifications';

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function ConfirmacaoPage() {
  const router = useRouter();
  const {
    selectedStore,
    orderType,
    cart,
    cartTotal,
    orderId,
    customerName,
    customerPhone,
    addressStreet,
    addressNumber,
    addressComplement,
    addressNeighborhood,
    notes,
    resetAll,
  } = useCart();

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

  const customerAddress = isDelivery
    ? `${addressStreet}, ${addressNumber}${addressComplement ? ` - ${addressComplement}` : ''} - ${addressNeighborhood}`
    : undefined;

  const whatsAppLink = generateWhatsAppOrderLink({
    orderId,
    customerName,
    customerPhone,
    customerAddress,
    orderType: orderType ?? 'pickup',
    items: cart.map((i) => ({
      product_name: i.product_name,
      size: i.size,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })),
    total: cartTotal,
    notes,
    storeName: selectedStore?.name,
  });

  const handleNewOrder = () => {
    resetAll();
    router.push('/pedido');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start pt-12 px-4 pb-8">
      {/* Checkmark Animation */}
      <div className="mb-6">
        <div className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center animate-bounce">
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
      <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>

      {/* Status Badge */}
      <span className="inline-block bg-yellow-600/20 text-yellow-400 text-sm font-semibold px-4 py-1 rounded-full mb-4">
        Pendente
      </span>

      {/* Order Number */}
      <p className="text-gray-400 text-lg mb-1">
        Pedido <span className="text-white font-bold">#{orderId}</span>
      </p>

      {/* Estimated Time */}
      <p className="text-gray-500 text-sm mb-8">
        Tempo estimado: <span className="text-red-400 font-semibold">{estimatedTime}</span>
      </p>

      {/* Order Summary */}
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-5 space-y-3 mb-6">
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

        <div className="border-t border-gray-800 pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-red-400">{formatPrice(cartTotal)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        {/* WhatsApp Button */}
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Enviar via WhatsApp
        </a>

        {/* Track Order */}
        <button
          onClick={() => router.push('/acompanhar')}
          className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all duration-200"
        >
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
