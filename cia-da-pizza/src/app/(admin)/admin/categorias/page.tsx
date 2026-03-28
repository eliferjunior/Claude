'use client';

import { useState, useEffect } from 'react';

type Category = {
  id: number;
  name: string;
  order_position: number;
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormName('');
    setFormPosition('');
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormPosition(String(cat.order_position));
    setShowForm(false);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            order_position: Number(formPosition) || 0,
          }),
        });
        if (res.ok) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingId
                ? { ...c, name: formName.trim(), order_position: Number(formPosition) || 0 }
                : c,
            ),
          );
          resetForm();
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            order_position: Number(formPosition) || 0,
          }),
        });
        if (res.ok) {
          resetForm();
          fetchCategories();
        }
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Categorias</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Nova Categoria
        </button>
      </div>

      {/* Inline Form - New */}
      {showForm && (
        <div className="mb-6 rounded-xl bg-gray-800 p-4 ring-1 ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-white">Nova Categoria</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-gray-400">Nome</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="mb-1 block text-sm text-gray-400">Posicao</label>
              <input
                type="number"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={resetForm}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories list */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-400">Nenhuma categoria cadastrada</p>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl bg-gray-800/50 p-4 ring-1 ring-gray-700"
              >
                {editingId === cat.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">Nome</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">Posicao</label>
                      <input
                        type="number"
                        value={formPosition}
                        onChange={(e) => setFormPosition(e.target.value)}
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving || !formName.trim()}
                        className="rounded px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        onClick={resetForm}
                        className="rounded px-3 py-1.5 text-xs font-medium text-white bg-gray-600 hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{cat.name}</p>
                      <span className="text-xs text-gray-400">Posicao: {cat.order_position}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-xl ring-1 ring-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800 text-left text-gray-400">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Posicao</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className={`border-b border-gray-700/50 ${
                      idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20'
                    }`}
                  >
                    {editingId === cat.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={formPosition}
                            onChange={(e) => setFormPosition(e.target.value)}
                            className="w-20 rounded-lg border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              disabled={saving || !formName.trim()}
                              className="rounded px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                              onClick={resetForm}
                              className="rounded px-3 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-500"
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-white">{cat.name}</td>
                        <td className="px-4 py-3 text-gray-300">{cat.order_position}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(cat)}
                              className="rounded px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="rounded px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
