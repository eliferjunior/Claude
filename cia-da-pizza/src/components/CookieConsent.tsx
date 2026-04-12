'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'cia_pizza_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up">
      <div className="mx-auto max-w-3xl bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-300">
              Utilizamos cookies essenciais para o funcionamento do site e armazenamos dados locais
              para agilizar seus pedidos. Ao continuar navegando, voce concorda com nossa{' '}
              <Link
                href="/politica-privacidade"
                className="text-red-400 hover:underline font-medium"
              >
                Politica de Privacidade
              </Link>{' '}
              em conformidade com a LGPD.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/politica-privacidade"
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition"
            >
              Saiba mais
            </Link>
            <button
              onClick={accept}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
