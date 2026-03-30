'use client';

import { useEffect, useState } from 'react';

type Promotion = {
  id: number;
  title: string;
  description: string | null;
  discount_percent: number | null;
  discount_value: number | null;
  promo_code: string | null;
  banner_color: string;
  image_url: string | null;
};

export default function PromoBanner() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/promotions?active=1')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromotions(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  if (promotions.length === 0 || dismissed) return null;

  const promo = promotions[currentIndex];

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: promo.banner_color }}>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center justify-center gap-3 text-center">
            <div className="text-white">
              <p className="text-sm font-bold sm:text-base">{promo.title}</p>
              {promo.description && (
                <p className="text-xs opacity-90 sm:text-sm">{promo.description}</p>
              )}
              <div className="mt-1 flex items-center justify-center gap-3 text-xs sm:text-sm">
                {promo.discount_percent && (
                  <span className="font-bold bg-white/20 px-2 py-0.5 rounded">
                    {promo.discount_percent}% OFF
                  </span>
                )}
                {promo.discount_value && (
                  <span className="font-bold bg-white/20 px-2 py-0.5 rounded">
                    R$ {Number(promo.discount_value).toFixed(2)} OFF
                  </span>
                )}
                {promo.promo_code && (
                  <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                    {promo.promo_code}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {promotions.length > 1 && (
              <div className="hidden sm:flex gap-1">
                {promotions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 text-white/70 hover:text-white hover:bg-white/10"
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
        </div>
      </div>
    </div>
  );
}
