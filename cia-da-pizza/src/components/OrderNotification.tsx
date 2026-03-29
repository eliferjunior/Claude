'use client';

import { useState, useEffect, useCallback } from 'react';

interface OrderNotificationProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  enableSound?: boolean;
}

function playNotificationSound() {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch {
    // Web Audio API nao suportado
  }
}

export default function OrderNotification({
  message,
  type = 'success',
  visible,
  onDismiss,
  duration = 5000,
  enableSound = true,
}: OrderNotificationProps) {
  const [show, setShow] = useState(false);

  const dismiss = useCallback(() => {
    setShow(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      setShow(true);
      if (enableSound) {
        playNotificationSound();
      }
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, duration, enableSound, dismiss]);

  if (!visible && !show) return null;

  const bgColor = {
    success: 'bg-green-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  }[type];

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
  }[type];

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${
        show ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`${bgColor} text-white shadow-lg`}>
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={dismiss}
              className="rounded-lg p-1 hover:bg-white/20 transition"
              aria-label="Fechar notificacao"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
