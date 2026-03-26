'use client';

import { useState, useEffect } from 'react';

type Store = {
  id: number;
  name: string;
  address: string;
  phone: string;
  allows_delivery: boolean;
  allows_pickup: boolean;
  allows_reservation: boolean;
  allows_dine_in: boolean;
  whatsapp_number: string;
  whatsapp_default_message: string;
  username: string;
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

export default function LojasPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    try {
      const res = await fetch('/api/stores');
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function updateStore(id: number, updates: Partial<Store>) {
    setSavingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
        setMessage({ type: 'success', text: 'Loja atualizada com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar loja.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggle(store: Store, field: keyof Store) {
    const newValue = !store[field];
    await updateStore(store.id, { [field]: newValue });
  }

  async function handleFieldChange(store: Store, field: keyof Store, value: string) {
    setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, [field]: value } : s)));
  }

  async function handleFieldBlur(store: Store, field: keyof Store) {
    await updateStore(store.id, { [field]: store[field] });
  }

  async function handleResetPassword(storeId: number) {
    setResettingId(storeId);
    setMessage(null);
    try {
      const res = await fetch(`/api/stores/${storeId}/reset-password`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({
          type: 'success',
          text: `Senha redefinida com sucesso! Nova senha: ${data.newPassword || 'Verifique o e-mail.'}`,
        });
      } else {
        setMessage({ type: 'error', text: 'Erro ao redefinir senha.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setResettingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Lojas</h1>

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

      {stores.length === 0 ? (
        <div className="rounded-xl bg-gray-800/50 p-8 text-center ring-1 ring-gray-700">
          <p className="text-gray-400">Nenhuma loja cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {stores.map((store) => (
            <div key={store.id} className="rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{store.name}</h2>
                  {store.address && <p className="text-sm text-gray-400">{store.address}</p>}
                </div>
                {savingId === store.id && (
                  <span className="text-xs text-gray-400">Salvando...</span>
                )}
              </div>

              {/* Toggles */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
                  <span className="text-sm text-gray-300">Permite Entrega</span>
                  <Toggle
                    checked={store.allows_delivery}
                    onChange={() => handleToggle(store, 'allows_delivery')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
                  <span className="text-sm text-gray-300">Permite Retirada</span>
                  <Toggle
                    checked={store.allows_pickup}
                    onChange={() => handleToggle(store, 'allows_pickup')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
                  <span className="text-sm text-gray-300">Permite Reserva</span>
                  <Toggle
                    checked={store.allows_reservation}
                    onChange={() => handleToggle(store, 'allows_reservation')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
                  <span className="text-sm text-gray-300">Permite Consumo Local</span>
                  <Toggle
                    checked={store.allows_dine_in}
                    onChange={() => handleToggle(store, 'allows_dine_in')}
                  />
                </div>
              </div>

              {/* WhatsApp fields */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  WhatsApp
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-300">Número do WhatsApp</label>
                    <input
                      type="text"
                      value={store.whatsapp_number || ''}
                      onChange={(e) => handleFieldChange(store, 'whatsapp_number', e.target.value)}
                      onBlur={() => handleFieldBlur(store, 'whatsapp_number')}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="5511999999999"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">Mensagem Padrão</label>
                    <input
                      type="text"
                      value={store.whatsapp_default_message || ''}
                      onChange={(e) =>
                        handleFieldChange(store, 'whatsapp_default_message', e.target.value)
                      }
                      onBlur={() => handleFieldBlur(store, 'whatsapp_default_message')}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="Olá! Gostaria de fazer um pedido."
                    />
                  </div>
                </div>
              </div>

              {/* Login credentials */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Credenciais de Acesso
                </h3>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm text-gray-300">Usuário</label>
                    <input
                      type="text"
                      value={store.username || ''}
                      readOnly
                      className="w-full rounded-lg border border-gray-600 bg-gray-600/50 px-4 py-2 text-gray-300 cursor-not-allowed"
                    />
                  </div>

                  <button
                    onClick={() => handleResetPassword(store.id)}
                    disabled={resettingId === store.id}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resettingId === store.id ? 'Redefinindo...' : 'Redefinir Senha'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
