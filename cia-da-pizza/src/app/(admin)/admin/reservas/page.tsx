'use client';

import { useState, useEffect, useMemo } from 'react';

type Reservation = {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  store_name?: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

const statusBadgeColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  confirmed: 'bg-green-500/20 text-green-500',
  cancelled: 'bg-red-500/20 text-red-500',
};

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : data.reservations || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar reservas.' });
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let result = reservations;
    if (filterDate) {
      result = result.filter((r) => r.date === filterDate);
    }
    if (filterStatus) {
      result = result.filter((r) => r.status === filterStatus);
    }
    return result;
  }, [reservations, filterDate, filterStatus]);

  async function updateStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        const label = statusLabels[status] || status;
        setMessage({ type: 'success', text: `Reserva marcada como "${label}"!` });

        // WhatsApp notification
        const reservation = reservations.find((r) => r.id === id);
        if (reservation?.customer_phone) {
          const phone = reservation.customer_phone.replace(/\D/g, '');
          const dateFormatted = new Date(reservation.date + 'T00:00:00').toLocaleDateString(
            'pt-BR',
          );
          let whatsMsg = '';
          if (status === 'confirmed') {
            whatsMsg = `Ola ${reservation.customer_name}! Sua reserva na Cia da Pizza para ${dateFormatted} as ${reservation.time} para ${reservation.party_size} pessoa(s) foi *CONFIRMADA*! Te esperamos!`;
          } else if (status === 'cancelled') {
            whatsMsg = `Ola ${reservation.customer_name}, infelizmente sua reserva para ${dateFormatted} as ${reservation.time} nao pode ser confirmada. Entre em contato para mais detalhes.`;
          }
          if (whatsMsg && confirm(`Notificar ${reservation.customer_name} via WhatsApp?`)) {
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsMsg)}`, '_blank');
          }
        }
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar reserva.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    }
  }

  return (
    <div>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Reservas</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">Nenhuma reserva encontrada</p>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {filtered.map((res) => (
              <div key={res.id} className="rounded-xl bg-gray-800/50 p-4 ring-1 ring-gray-700">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{res.customer_name}</p>
                    <p className="text-xs text-gray-400">{res.customer_phone}</p>
                  </div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusBadgeColors[res.status] || ''
                    }`}
                  >
                    {statusLabels[res.status] || res.status}
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-300">
                  <span>
                    {new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {res.time}
                  </span>
                  <span>
                    {res.party_size} pessoa{res.party_size !== 1 ? 's' : ''}
                  </span>
                  {res.store_name && <span>{res.store_name}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {res.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(res.id, 'confirmed')}
                        className="rounded px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => updateStatus(res.id, 'cancelled')}
                        className="rounded px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(res.id, 'cancelled')}
                      className="rounded px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-xl ring-1 ring-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800 text-left text-gray-400">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Loja</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Pessoas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((res, idx) => (
                  <tr
                    key={res.id}
                    className={`border-b border-gray-700/50 ${
                      idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="text-white">{res.customer_name}</div>
                      {res.customer_email && (
                        <div className="text-xs text-gray-500">{res.customer_email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{res.customer_phone}</td>
                    <td className="px-4 py-3 text-gray-300">{res.store_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{res.time}</td>
                    <td className="px-4 py-3 text-gray-300">{res.party_size}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          statusBadgeColors[res.status] || ''
                        }`}
                      >
                        {statusLabels[res.status] || res.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {res.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(res.id, 'confirmed')}
                              className="rounded px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => updateStatus(res.id, 'cancelled')}
                              className="rounded px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(res.id, 'cancelled')}
                            className="rounded px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
