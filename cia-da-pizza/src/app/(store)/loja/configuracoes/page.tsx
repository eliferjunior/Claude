'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type StoreSettings = {
  id: number;
  name: string;
  address: string;
  phone: string;
  allows_delivery: boolean;
  allows_pickup: boolean;
  allows_reservation: boolean;
  allows_dine_in: boolean;
  max_reservations: number;
  max_reservation_guests: number;
  whatsapp_number: string;
  whatsapp_message: string;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        checked ? 'bg-green-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function StoreConfiguracoesPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/store/me');
        if (!meRes.ok) {
          router.push('/loja/login');
          return;
        }
        const me = await meRes.json();
        setStoreId(me.store_id);

        const storeRes = await fetch(`/api/stores/${me.store_id}`);
        if (storeRes.ok) {
          const data = await storeRes.json();
          setSettings(data);
        }
      } catch {
        setMessage({ type: 'error', text: 'Erro ao carregar configuracoes.' });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleSave() {
    if (!storeId || !settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allows_delivery: settings.allows_delivery,
          allows_pickup: settings.allows_pickup,
          allows_reservation: settings.allows_reservation,
          allows_dine_in: settings.allows_dine_in,
          max_reservations: settings.max_reservations,
          max_reservation_guests: settings.max_reservation_guests,
          whatsapp_number: settings.whatsapp_number,
          whatsapp_message: settings.whatsapp_message,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuracoes salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configuracoes.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexao.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!settings) {
    return <p className="text-gray-400">Erro ao carregar configuracoes da loja.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Configuracoes da Loja</h1>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Service Toggles */}
      <section className="mb-8 rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-white">Servicos Disponiveis</h2>
        <p className="mb-4 text-sm text-gray-400">
          Habilite ou desabilite os servicos oferecidos pela sua loja.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-white">Delivery (Entrega)</span>
              <p className="text-xs text-gray-400">Permite pedidos para entrega</p>
            </div>
            <Toggle
              checked={settings.allows_delivery}
              onChange={(val) => setSettings({ ...settings, allows_delivery: val })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-white">Retirada no Local</span>
              <p className="text-xs text-gray-400">Permite pedidos para retirada</p>
            </div>
            <Toggle
              checked={settings.allows_pickup}
              onChange={(val) => setSettings({ ...settings, allows_pickup: val })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-white">Reservas de Mesa</span>
              <p className="text-xs text-gray-400">Permite clientes fazerem reservas</p>
            </div>
            <Toggle
              checked={settings.allows_reservation}
              onChange={(val) => setSettings({ ...settings, allows_reservation: val })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-white">Consumo no Local</span>
              <p className="text-xs text-gray-400">Permite pedidos para consumo na loja</p>
            </div>
            <Toggle
              checked={settings.allows_dine_in}
              onChange={(val) => setSettings({ ...settings, allows_dine_in: val })}
            />
          </div>
        </div>
      </section>

      {/* Reservation Limits */}
      <section className="mb-8 rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-white">Limites de Reserva</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Max. reservas por dia (0 = ilimitado)
            </label>
            <input
              type="number"
              min="0"
              value={settings.max_reservations || 0}
              onChange={(e) =>
                setSettings({ ...settings, max_reservations: parseInt(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Max. pessoas por reserva
            </label>
            <input
              type="number"
              min="1"
              value={settings.max_reservation_guests || 20}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_reservation_guests: parseInt(e.target.value) || 20,
                })
              }
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="mb-8 rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-white">WhatsApp</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Numero do WhatsApp
            </label>
            <input
              type="text"
              value={settings.whatsapp_number || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              placeholder="5516999999999"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Mensagem Padrao</label>
            <input
              type="text"
              value={settings.whatsapp_message || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp_message: e.target.value })}
              placeholder="Ola! Gostaria de fazer um pedido."
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Configuracoes'}
        </button>
      </div>
    </div>
  );
}
