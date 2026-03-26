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
      // silently fail
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
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div>
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
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800 text-left text-gray-400">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Email</th>
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
                  <td className="px-4 py-3 text-white">{res.customer_name}</td>
                  <td className="px-4 py-3 text-gray-300">{res.customer_phone}</td>
                  <td className="px-4 py-3 text-gray-300">{res.customer_email || '-'}</td>
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
      )}
    </div>
  );
}
