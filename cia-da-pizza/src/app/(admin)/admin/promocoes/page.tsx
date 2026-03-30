'use client';

import { useState, useEffect } from 'react';

type Promotion = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number | null;
  discount_value: number | null;
  promo_code: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  banner_color: string;
  created_at: string;
};

type PromoForm = {
  title: string;
  description: string;
  image_url: string;
  discount_percent: string;
  discount_value: string;
  promo_code: string;
  start_date: string;
  end_date: string;
  active: boolean;
  banner_color: string;
};

const emptyForm: PromoForm = {
  title: '',
  description: '',
  image_url: '',
  discount_percent: '',
  discount_value: '',
  promo_code: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  active: true,
  banner_color: '#dc2626',
};

export default function PromocoesPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    setLoading(true);
    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromotions(Array.isArray(data) ? data : []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar promocoes.' });
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(promo: Promotion) {
    setEditingId(promo.id);
    setForm({
      title: promo.title,
      description: promo.description || '',
      image_url: promo.image_url || '',
      discount_percent: promo.discount_percent != null ? String(promo.discount_percent) : '',
      discount_value: promo.discount_value != null ? String(promo.discount_value) : '',
      promo_code: promo.promo_code || '',
      start_date: promo.start_date,
      end_date: promo.end_date,
      active: promo.active,
      banner_color: promo.banner_color || '#dc2626',
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description || null,
        image_url: form.image_url || null,
        discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
        discount_value: form.discount_value ? Number(form.discount_value) : null,
        promo_code: form.promo_code || null,
        start_date: form.start_date,
        end_date: form.end_date || '2099-12-31',
        active: form.active,
        banner_color: form.banner_color,
      };

      const url = editingId ? `/api/promotions/${editingId}` : '/api/promotions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        setMessage({
          type: 'success',
          text: editingId ? 'Promocao atualizada!' : 'Promocao criada!',
        });
        fetchPromotions();
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar promocao.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexao.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta promocao?')) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: 'success', text: 'Promocao excluida!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao excluir.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexao.' });
    }
  }

  async function toggleActive(promo: Promotion) {
    try {
      const res = await fetch(`/api/promotions/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promo.active }),
      });
      if (res.ok) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, active: !p.active } : p)),
        );
        setMessage({
          type: 'success',
          text: `Promocao ${!promo.active ? 'ativada' : 'desativada'}!`,
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexao.' });
    }
  }

  function isActive(promo: Promotion): boolean {
    if (!promo.active) return false;
    const today = new Date().toISOString().split('T')[0];
    return promo.start_date <= today && promo.end_date >= today;
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
        <h1 className="text-2xl font-bold text-white">Promocoes</h1>
        <button
          onClick={openNew}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Nova Promocao
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : promotions.length === 0 ? (
        <div className="rounded-xl bg-gray-800/50 p-8 text-center ring-1 ring-gray-700">
          <p className="text-gray-400">Nenhuma promocao cadastrada.</p>
          <p className="mt-2 text-sm text-gray-500">
            Crie promocoes para exibir banners no site para seus clientes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="rounded-xl bg-gray-800/50 p-4 ring-1 ring-gray-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: promo.banner_color }}
                    />
                    <h3 className="text-sm font-semibold text-white">{promo.title}</h3>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        isActive(promo)
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {isActive(promo) ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {promo.description && (
                    <p className="text-xs text-gray-400 mb-1">{promo.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {promo.discount_percent && <span>{promo.discount_percent}% OFF</span>}
                    {promo.discount_value && (
                      <span>R$ {Number(promo.discount_value).toFixed(2)} OFF</span>
                    )}
                    {promo.promo_code && (
                      <span className="bg-gray-700 px-1.5 py-0.5 rounded font-mono">
                        {promo.promo_code}
                      </span>
                    )}
                    <span>
                      {promo.start_date} ate {promo.end_date}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleActive(promo)}
                    className={`rounded px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                      promo.active
                        ? 'bg-gray-600 hover:bg-gray-500'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {promo.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => openEdit(promo)}
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="fixed inset-0 flex flex-col bg-gray-800 sm:static sm:inset-auto sm:mx-4 sm:w-full sm:max-w-lg sm:rounded-xl sm:ring-1 sm:ring-gray-700 overflow-y-auto p-6">
            <h2 className="mb-4 text-lg font-bold text-white">
              {editingId ? 'Editar Promocao' : 'Nova Promocao'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Titulo *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Pizza grande com 20% OFF"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Descricao</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Detalhes da promocao..."
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Desconto %</label>
                  <input
                    type="number"
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Desconto R$</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder="5.00"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Codigo Promocional</label>
                <input
                  type="text"
                  value={form.promo_code}
                  onChange={(e) => setForm({ ...form, promo_code: e.target.value.toUpperCase() })}
                  placeholder="PIZZA20"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white font-mono focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Data Inicio</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Data Fim</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">URL da Imagem (banner)</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Cor do Banner</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.banner_color}
                    onChange={(e) => setForm({ ...form, banner_color: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded border border-gray-600 bg-gray-700"
                  />
                  <input
                    type="text"
                    value={form.banner_color}
                    onChange={(e) => setForm({ ...form, banner_color: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Preview */}
              {form.title && (
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Preview</label>
                  <div
                    className="rounded-lg p-4 text-white text-center"
                    style={{ backgroundColor: form.banner_color }}
                  >
                    <p className="text-sm font-bold">{form.title}</p>
                    {form.description && (
                      <p className="text-xs mt-1 opacity-90">{form.description}</p>
                    )}
                    {form.promo_code && (
                      <p className="mt-2 text-xs">
                        Use o codigo:{' '}
                        <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                          {form.promo_code}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
