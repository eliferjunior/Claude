'use client';

import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
}

let toastId = 0;

export function useCartToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(productName: string) {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message: `${productName} adicionado!` }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }

  return { toasts, showToast };
}

export default function AddToCartToast({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} message={toast.message} />
      ))}
    </div>
  );
}

function ToastItem({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
