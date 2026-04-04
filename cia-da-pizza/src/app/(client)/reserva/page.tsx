'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Store {
  id: number;
  name: string;
  address: string | null;
  allows_reservation: number;
}

interface ReservationResult {
  storeName: string;
  date: string;
  time: string;
  guests: number;
}

const TIME_SLOTS = [
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
];

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTH_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function getNext14Days(): { date: string; dayName: string; dayNum: number; monthName: string }[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      monthName: MONTH_NAMES[d.getMonth()],
    });
  }
  return days;
}

function formatDateBR(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

const STEP_LABELS = ['Loja', 'Data e Hora', 'Seus Dados'];

export default function ReservaPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState<ReservationResult | null>(null);

  // Step 1
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Step 2
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedGuests, setSelectedGuests] = useState(0);

  // Step 3
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const next14Days = useMemo(() => getNext14Days(), []);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('/api/stores?active=1');
        const data: Store[] = await res.json();
        setStores(data.filter((s) => s.allows_reservation === 1));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  async function handleSubmit() {
    if (!selectedStore || !selectedDate || !selectedTime || !selectedGuests || !customerName.trim())
      return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: selectedStore.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim() || null,
          customer_email: customerEmail.trim() || null,
          date: selectedDate,
          time: selectedTime,
          guests: selectedGuests,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Erro ao realizar reserva.');
      }

      setSuccess({
        storeName: selectedStore.name,
        date: selectedDate,
        time: selectedTime,
        guests: selectedGuests,
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
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-600 animate-bounce">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Reserva Confirmada!</h2>
          <p className="text-green-400 mb-6">Sua mesa esta reservada</p>
          <div className="bg-gray-700 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Loja</span>
              <span className="text-white font-medium">{success.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Data</span>
              <span className="text-white font-medium">{formatDateBR(success.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Horario</span>
              <span className="text-white font-medium">{success.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pessoas</span>
              <span className="text-white font-medium">{success.guests}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full rounded-xl bg-red-600 px-6 py-3 text-center font-semibold text-white hover:bg-red-700 transition"
            >
              Voltar ao Inicio
            </Link>
            <Link
              href="/pedido"
              className="w-full rounded-xl bg-gray-700 px-6 py-3 text-center font-semibold text-white hover:bg-gray-600 transition"
            >
              Fazer um Pedido
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-3 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Reservar Mesa
          </h1>
          <p className="mt-2 text-gray-400 text-sm sm:text-lg">
            Garanta sua mesa na Cia da Pizza
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const current = step === num;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition ${
                    done || current ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm ${current ? 'text-red-400 font-semibold' : 'text-gray-500'}`}
                >
                  {label}
                </span>
                {i < 2 && <div className="w-8 h-0.5 bg-gray-700 mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Step 1 - Escolha a Loja */}
        {step === 1 && (
          <div className="transition-opacity duration-300">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🏪</span> Escolha a Loja
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`text-left rounded-xl p-5 transition-all ${
                    selectedStore?.id === store.id
                      ? 'bg-gray-800 ring-2 ring-red-500'
                      : 'bg-gray-800 hover:ring-2 hover:ring-gray-600'
                  }`}
                >
                  <h3 className="text-lg font-bold text-white">{store.name}</h3>
                  {store.address && <p className="text-sm text-gray-400 mt-1">{store.address}</p>}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedStore}
                className="rounded-xl bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proximo
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Data, Hora e Pessoas */}
        {step === 2 && (
          <div className="transition-opacity duration-300 space-y-6">
            {/* Date Selection */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">📅</span> Escolha a Data
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {next14Days.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`shrink-0 flex flex-col items-center rounded-xl px-4 py-3 min-w-[70px] transition-all ${
                      selectedDate === day.date
                        ? 'bg-red-600 text-white ring-2 ring-red-500'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xs font-medium opacity-70">{day.dayName}</span>
                    <span className="text-xl font-bold">{day.dayNum}</span>
                    <span className="text-xs opacity-70">{day.monthName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🕐</span> Escolha o Horario
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-xl py-3 text-sm font-semibold transition-all ${
                      selectedTime === time
                        ? 'bg-red-600 text-white ring-2 ring-red-500'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Selection */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">👥</span> Quantas Pessoas?
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {GUEST_OPTIONS.map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedGuests(num)}
                    className={`rounded-xl py-3 text-sm font-bold transition-all ${
                      selectedGuests === num
                        ? 'bg-red-600 text-white ring-2 ring-red-500'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl bg-gray-700 px-6 py-3 font-bold text-white hover:bg-gray-600 transition"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime || !selectedGuests}
                className="rounded-xl bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proximo
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Dados Pessoais */}
        {step === 3 && (
          <div className="transition-opacity duration-300">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Seus Dados
            </h2>

            {/* Summary */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-gray-700 rounded-lg px-3 py-1.5 text-gray-300">
                  📍 {selectedStore?.name}
                </span>
                <span className="bg-gray-700 rounded-lg px-3 py-1.5 text-gray-300">
                  📅 {selectedDate && formatDateBR(selectedDate)}
                </span>
                <span className="bg-gray-700 rounded-lg px-3 py-1.5 text-gray-300">
                  🕐 {selectedTime}
                </span>
                <span className="bg-gray-700 rounded-lg px-3 py-1.5 text-gray-300">
                  👥 {selectedGuests} pessoas
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Nome *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(16) 99999-9999"
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Observacoes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Aniversario, cadeira infantil, etc. (opcional)"
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {submitError && (
              <div className="mt-4 bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex justify-between mt-6 gap-3">
              <button
                onClick={() => setStep(2)}
                className="rounded-xl bg-gray-700 px-6 py-3 font-bold text-white hover:bg-gray-600 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !customerName.trim()}
                className="rounded-xl bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
