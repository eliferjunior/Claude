'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const storeIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReservations = useCallback(
    async (sid?: number | null) => {
      const id = sid ?? storeIdRef.current;
      if (!id) return;
      try {
        let url = `/api/reservations?store_id=${id}`;
        if (filterStatus) url += `&status=${filterStatus}`;
        if (filterDate) url += `&date=${filterDate}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, filterDate],
  );

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/store/me');
      if (!meRes.ok) {
        router.push('/loja/login');
        return;
      }
      const me = await meRes.json();
      setStoreId(me.store_id);
      storeIdRef.current = me.store_id;
      await fetchReservations(me.store_id);
    }
    init();
  }, [router, fetchReservations]);

  useEffect(() => {
    fetchReservations();
  }, [filterStatus, filterDate, fetchReservations]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!storeId) return;
    intervalRef.current = setInterval(() => fetchReservations(storeId), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storeId, fetchReservations]);

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
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar reserva.' });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexao.' });
      setTimeout(() => setMessage(null), 4000);
    }
  }

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  const today = new Date().toISOString().split('T')[0];
  const pendingCount = reservations.filter((r) => r.status === 'pending').length;
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservas</h1>
          <p className="text-sm text-gray-400 mt-1">
            {pendingCount > 0 && (
              <span className="text-yellow-400 font-medium">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
            {pendingCount > 0 && confirmedCount > 0 && ' · '}
            {confirmedCount > 0 && (
              <span className="text-green-400 font-medium">
                {confirmedCount} confirmada{confirmedCount > 1 ? 's' : ''}
              </span>
            )}
            {pendingCount === 0 && confirmedCount === 0 && 'Nenhuma reserva ativa'}
          </p>
        </div>
        <button
          onClick={() => fetchReservations(storeId)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Atualizar
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-600/20 text-green-400 border border-green-700'
              : 'bg-red-600/20 text-red-400 border border-red-700'
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === ''
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Todas
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterDate(today)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterDate === today
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Hoje
        </button>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-gray-800 hover:bg-gray-700"
          >
            Limpar data
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : reservations.length === 0 ? (
        <div className="text-gray-400 text-center py-12">
          <span className="text-4xl block mb-3">📅</span>
          Nenhuma reserva encontrada.
        </div>
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
                    {reservation.customer_phone && (
                      <a
                        href={`tel:${reservation.customer_phone}`}
                        className="ml-2 text-red-400 hover:underline"
                      >
                        {reservation.customer_phone}
                      </a>
                    )}
                  </p>
                  {reservation.customer_email && (
                    <p className="text-sm text-gray-500">{reservation.customer_email}</p>
                  )}
                  {reservation.notes && (
                    <p className="text-sm text-amber-400 mt-0.5 italic">Obs: {reservation.notes}</p>
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
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5"
                    >
                      <svg
                        className="w-4 h-4"
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
                      Confirmar
                    </button>
                    <button
                      onClick={() => updateStatus(reservation.id, 'cancelled')}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-red-400 text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Recusar
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

      <p className="mt-6 text-center text-xs text-gray-600">Atualiza automaticamente a cada 30s</p>
    </div>
  );
}
