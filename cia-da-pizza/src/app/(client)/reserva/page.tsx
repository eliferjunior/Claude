'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Store {
  id: number;
  name: string;
  allows_reservation: number;
}

interface FormData {
  store_id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
}

interface ReservationResult {
  storeName: string;
  date: string;
  time: string;
  guests: string;
}

const TIME_OPTIONS: string[] = [];
for (let h = 18; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 23) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
  }
}

function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateBR(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

export default function ReservaPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState<ReservationResult | null>(null);

  const [form, setForm] = useState<FormData>({
    store_id: '',
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: '',
    notes: '',
  });

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('/api/stores?active=1');
        const data: Store[] = await res.json();
        setStores(data.filter((s) => s.allows_reservation === 1));
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.store_id) {
      newErrors.store_id = 'Selecione uma loja.';
    }
    if (!form.name.trim()) {
      newErrors.name = 'Informe seu nome completo.';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Informe seu telefone.';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'E-mail invalido.';
    }
    if (!form.date) {
      newErrors.date = 'Selecione uma data.';
    }
    if (!form.time) {
      newErrors.time = 'Selecione um horario.';
    }
    if (!form.guests) {
      newErrors.guests = 'Informe o numero de pessoas.';
    } else {
      const n = Number(form.guests);
      if (n < 1 || n > 20) {
        newErrors.guests = 'O numero de pessoas deve ser entre 1 e 20.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: Number(form.store_id),
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim(),
          date: form.date,
          time: form.time,
          guests: Number(form.guests),
          notes: form.notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao realizar reserva.');
      }

      const storeName = stores.find((s) => s.id === Number(form.store_id))?.name || '';
      setSuccess({
        storeName,
        date: form.date,
        time: form.time,
        guests: form.guests,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao realizar reserva.');
    } finally {
      setSubmitting(false);
    }
  }

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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-800 rounded-2xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
            <svg
              className="h-8 w-8 text-green-500"
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
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Reserva Confirmada!</h2>
          <p className="text-green-400 text-lg mb-6">Sua reserva foi realizada com sucesso.</p>
          <div className="bg-gray-700 rounded-xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-gray-400">Loja:</span>
              <span className="text-white font-medium">{success.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Data:</span>
              <span className="text-white font-medium">{formatDateBR(success.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Horario:</span>
              <span className="text-white font-medium">{success.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pessoas:</span>
              <span className="text-white font-medium">{success.guests}</span>
            </div>
          </div>
          <Link
            href="/"
            className="inline-block w-full rounded-xl bg-red-600 px-6 py-3 text-center font-semibold text-white hover:bg-red-700 transition"
          >
            Voltar ao Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Fazer Reserva</h1>
          <p className="mt-3 text-gray-400 text-lg">
            Reserve sua mesa e garanta seu lugar na Cia da Pizza
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Loja */}
            <div>
              <label htmlFor="store_id" className="block text-sm font-medium text-gray-300 mb-2">
                Loja *
              </label>
              <select
                id="store_id"
                name="store_id"
                value={form.store_id}
                onChange={handleChange}
                className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              >
                <option value="">Selecione uma loja</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {errors.store_id && <p className="mt-1 text-sm text-red-500">{errors.store_id}</p>}
            </div>

            {/* Nome completo */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefone *
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Data e Horario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={getTodayString()}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                  Horario *
                </label>
                <select
                  id="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                >
                  <option value="">Selecione o horario</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
              </div>
            </div>

            {/* Numero de pessoas */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-300 mb-2">
                Numero de pessoas *
              </label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={form.guests}
                onChange={handleChange}
                min={1}
                max={20}
                placeholder="1 a 20 pessoas"
                className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              {errors.guests && <p className="mt-1 text-sm text-red-500">{errors.guests}</p>}
            </div>

            {/* Observacoes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Observacoes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Alguma observacao especial? (opcional)"
                className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="rounded-xl bg-red-600/20 border border-red-600/50 p-4">
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Enviando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
