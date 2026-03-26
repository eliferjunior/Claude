'use client';

import { useState, useEffect } from 'react';

type Settings = {
  company_name: string;
  company_logo_url: string;
  primary_color: string;
  secondary_color: string;
  company_instagram: string;
  company_facebook: string;
  whatsapp_enabled: boolean;
  whatsapp_number: string;
  whatsapp_default_message: string;
};

const defaultSettings: Settings = {
  company_name: '',
  company_logo_url: '',
  primary_color: '#dc2626',
  secondary_color: '#1f2937',
  company_instagram: '',
  company_facebook: '',
  whatsapp_enabled: false,
  whatsapp_number: '',
  whatsapp_default_message: '',
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

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão ao salvar.' });
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Configurações</h1>

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

      {/* Identidade da Empresa */}
      <section className="mb-8 rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-white">Identidade da Empresa</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Nome da Empresa</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => updateField('company_name', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Ex: Cia da Pizza"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">URL do Logo</label>
            <input
              type="text"
              value={settings.company_logo_url}
              onChange={(e) => updateField('company_logo_url', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Cor Primária</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Cor Secundária</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => updateField('secondary_color', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => updateField('secondary_color', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redes Sociais */}
      <section className="mb-8 rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-white">Redes Sociais</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Instagram</label>
            <input
              type="text"
              value={settings.company_instagram}
              onChange={(e) => updateField('company_instagram', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="https://instagram.com/suaempresa"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Facebook</label>
            <input
              type="text"
              value={settings.company_facebook}
              onChange={(e) => updateField('company_facebook', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="https://facebook.com/suaempresa"
            />
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="mb-8 rounded-xl bg-gray-800/50 p-6 ring-1 ring-gray-700">
        <h2 className="mb-4 text-lg font-semibold text-white">WhatsApp</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Habilitar WhatsApp</label>
            <Toggle
              checked={settings.whatsapp_enabled}
              onChange={(val) => updateField('whatsapp_enabled', val)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Número do WhatsApp
            </label>
            <input
              type="text"
              value={settings.whatsapp_number}
              onChange={(e) => updateField('whatsapp_number', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="5511999999999"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Mensagem Padrão do WhatsApp
            </label>
            <textarea
              value={settings.whatsapp_default_message}
              onChange={(e) => updateField('whatsapp_default_message', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Olá! Gostaria de fazer um pedido."
            />
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
