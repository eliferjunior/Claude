'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

const steps = ['Loja', 'Tipo', 'Cardapio', 'Finalizar'];

export default function TipoPage() {
  const router = useRouter();
  const { selectedStore, setOrderType } = useCart();

  useEffect(() => {
    if (!selectedStore) {
      router.replace('/pedido');
    }
  }, [selectedStore, router]);

  if (!selectedStore) {
    return null;
  }

  const handleSelect = (type: 'delivery' | 'pickup') => {
    setOrderType(type);
    router.push('/pedido/cardapio');
  };

  const handleReserva = () => {
    router.push(`/reserva?store_id=${selectedStore.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Progress Bar */}
      <div className="w-full px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i + 1 <= 2 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${i + 1 <= 2 ? 'text-red-400' : 'text-gray-500'}`}>
                    {step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-12px] ${
                      i + 1 < 2 ? 'bg-red-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pb-6 text-center">
        <h1 className="text-2xl font-bold">Como deseja pedir?</h1>
        <p className="text-gray-400 mt-1">
          Escolha o tipo de atendimento para{' '}
          <span className="text-red-400 font-semibold">{selectedStore.name}</span>
        </p>
      </div>

      {/* Options */}
      <div className="max-w-md mx-auto px-4 space-y-4">
        {selectedStore.allows_delivery === 1 && (
          <button
            onClick={() => handleSelect('delivery')}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-red-600 hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="text-4xl mb-3">&#x1F6F5;</div>
            <h2 className="text-xl font-bold group-hover:text-red-400 transition-colors">
              Entrega
            </h2>
            <p className="text-gray-400 text-sm mt-1">Receba seu pedido no conforto da sua casa</p>
          </button>
        )}

        {selectedStore.allows_pickup === 1 && (
          <button
            onClick={() => handleSelect('pickup')}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-red-600 hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="text-4xl mb-3">&#x1F3EA;</div>
            <h2 className="text-xl font-bold group-hover:text-red-400 transition-colors">
              Retirada
            </h2>
            <p className="text-gray-400 text-sm mt-1">Retire seu pedido diretamente na loja</p>
          </button>
        )}

        <button
          onClick={handleReserva}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-red-600 hover:bg-gray-800 transition-all duration-200 group"
        >
          <div className="text-4xl mb-3">&#x1F4C5;</div>
          <h2 className="text-xl font-bold group-hover:text-red-400 transition-colors">Reserva</h2>
          <p className="text-gray-400 text-sm mt-1">Reserve uma mesa no restaurante</p>
        </button>
      </div>

      {/* Voltar Button */}
      <div className="max-w-md mx-auto px-4 mt-8 pb-8">
        <button
          onClick={() => router.push('/pedido')}
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
