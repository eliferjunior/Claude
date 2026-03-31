'use client';

import { useState, useEffect } from 'react';

interface CartItem {
  product_id: number;
  product_name: string;
  size: 'P' | 'M' | 'G';
  quantity: number;
  unit_price: number;
}

interface FloatingCartProps {
  items: CartItem[];
  total: number;
  onRemove: (index: number) => void;
  onAdvance: () => void;
  canAdvance: boolean;
}

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getSizeLabel(size: 'P' | 'M' | 'G'): string {
  if (size === 'P') return 'Pequena';
  if (size === 'M') return 'Media';
  return 'Grande';
}

export default function FloatingCart({
  items,
  total,
  onRemove,
  onAdvance,
  canAdvance,
}: FloatingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (totalItems > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (totalItems === 0) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Expanded Cart Panel */}
      <div
        className={`fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-6 sm:right-6 sm:w-96 z-50 transition-all duration-300 ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full sm:translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-gray-800 sm:rounded-2xl shadow-2xl border-t sm:border border-gray-700 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <h3 className="text-lg font-bold text-white">
                Carrinho ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white transition"
              aria-label="Fechar carrinho"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.product_id}-${item.size}-${index}`}
                className="flex items-center gap-3 bg-gray-700/50 rounded-xl p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getSizeLabel(item.size)} x{item.quantity}
                  </p>
                  <p className="text-sm text-red-400 font-bold">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="shrink-0 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                  aria-label="Remover item"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-red-400 font-extrabold text-xl">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onAdvance();
              }}
              disabled={!canAdvance}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3.5 font-bold text-white hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
            >
              <span>Finalizar Pedido</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-lg shadow-red-600/30 hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 px-5 py-3.5 ${
            bounce ? 'scale-110' : ''
          }`}
          aria-label={`Carrinho com ${totalItems} itens`}
        >
          {/* Cart icon */}
          <div className="relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-bold text-sm">
            {formatPrice(total)}
          </span>
        </button>
      )}
    </>
  );
}
