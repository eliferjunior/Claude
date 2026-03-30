'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Reservation = {
  id: number;
  store_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  date: string;
  time: string;
  guests: number;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-700',
  confirmed: 'bg-green-600/20 text-green-400 border-green-700',
  cancelled: 'bg-red-600/20 text-red-400 border-red-700',
};

export default function StoreReservasPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/store/me');
      if (!meRes.ok) {
        router.push('/loja/login');
        return;
      }
      const me = await meRes.json();
      setStoreId(me.store_id);
    }
    init();
  }, [router]);

  useEffect(() => {
    if (!storeId) return;
    fetchReservations();
  }, [storeId]);

  async function fetchReservations() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations?store_id=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
    } finally {
      setLoading(false);
    }
  }

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function updateStatus(reservationId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === reservationId ? { ...r, status: newStatus } : r)),
        );

        const statusMsg = newStatus === 'confirmed' ? 'confirmada' : 'cancelada';
        setMessage({ type: 'success', text: `Reserva #${reservationId} ${statusMsg}!` });

        // WhatsApp notification to customer
        const reservation = reservations.find((r) => r.id === reservationId);
        if (reservation?.customer_phone) {
          const phone = reservation.customer_phone.replace(/\D/g, '');
          let whatsMsg = '';
          if (newStatus === 'confirmed') {
            whatsMsg = `Ola ${reservation.customer_name}! Sua reserva na Cia da Pizza para o dia ${formatDate(reservation.date)} as ${reservation.time} para ${reservation.guests} pessoa(s) foi *CONFIRMADA*! Te esperamos! 🍕`;
          } else if (newStatus === 'cancelled') {
            whatsMsg = `Ola ${reservation.customer_name}, infelizmente sua reserva para o dia ${formatDate(reservation.date)} as ${reservation.time} nao pode ser confirmada. Entre em contato conosco para mais detalhes. Obrigado pela compreensao!`;
          }
          if (whatsMsg && confirm(`Deseja notificar ${reservation.customer_name} via WhatsApp?`)) {
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsMsg)}`;
            window.open(url, '_blank');
          }
        }
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar reserva.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexao.' });
    }
  }

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Reservas</h1>

      {message && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-3 hover:opacity-70">
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
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : reservations.length === 0 ? (
        <div className="text-gray-400 text-center py-12">Nenhuma reserva encontrada.</div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">Reserva #{reservation.id}</h3>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[reservation.status] || ''}`}
                    >
                      {STATUS_LABELS[reservation.status] || reservation.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    <span className="font-medium text-white">{reservation.customer_name}</span>
                    {reservation.customer_phone && ` - ${reservation.customer_phone}`}
                  </p>
                  {reservation.customer_email && (
                    <p className="text-sm text-gray-500">{reservation.customer_email}</p>
                  )}
                  {reservation.notes && (
                    <p className="text-sm text-gray-500 mt-0.5 italic">Obs: {reservation.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {formatDate(reservation.date)} - {reservation.time}
                  </p>
                  <p className="text-sm text-gray-400">
                    {reservation.guests} {reservation.guests === 1 ? 'pessoa' : 'pessoas'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(reservation.id, 'confirmed')}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => updateStatus(reservation.id, 'cancelled')}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-red-400 text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {reservation.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(reservation.id, 'cancelled')}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-red-400 text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
