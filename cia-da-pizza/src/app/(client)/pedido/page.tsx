'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, Store } from '@/contexts/CartContext';

const STEPS = ['Loja', 'Tipo', 'Cardapio', 'Checkout'];

export default function PedidoLojaPage() {
  const router = useRouter();
  const { selectedStore, setSelectedStore } = useCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('/api/stores?active=1');
        const data = await res.json();
        setStores(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="mt-4 text-gray-400 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  const currentStep = 1;

  return (
    <div className="min-h-screen bg-gray-900 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Fazer Pedido
          </h1>
          <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg">
            Escolha a loja para comecar
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => {
              const stepNum = i + 1;
              const isCompleted = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div key={label} className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-bold transition-colors ${
                      isCompleted || isCurrent
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
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
                      stepNum
                    )}
                  </div>
                  <span
                    className={`mt-1 text-xs sm:text-sm text-center ${
                      isCompleted || isCurrent ? 'text-red-400 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-0 mt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full mx-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentStep > s ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Store Selection */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Escolha a Loja</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`text-left rounded-xl p-5 transition-all ${
                  selectedStore?.id === store.id
                    ? 'bg-gray-800 ring-2 ring-red-500'
                    : 'bg-gray-800 hover:ring-2 hover:ring-gray-600'
                }`}
              >
                <h3 className="text-lg font-bold text-white">{store.name}</h3>
                {store.address && <p className="text-sm text-gray-400 mt-1">{store.address}</p>}
                {store.phone && <p className="text-sm text-gray-500 mt-1">{store.phone}</p>}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => router.push('/pedido/tipo')}
              disabled={!selectedStore}
              className="rounded-xl bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
