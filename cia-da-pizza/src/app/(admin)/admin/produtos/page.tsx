'use client';

import { useState, useEffect } from 'react';

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  category_id: number | null;
  category_name?: string;
  price_small: number | null;
  price_medium: number | null;
  price_large: number | null;
  image_url: string | null;
  active: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  category_id: string;
  price_small: string;
  price_medium: string;
  price_large: string;
  image_url: string;
};

const emptyForm: ProductForm = {
  name: '',
  description: '',
  category_id: '',
  price_small: '',
  price_medium: '',
  price_large: '',
  image_url: '',
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || data);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id ? String(product.category_id) : '',
      price_small: product.price_small != null ? String(product.price_small) : '',
      price_medium: product.price_medium != null ? String(product.price_medium) : '',
      price_large: product.price_large != null ? String(product.price_large) : '',
      image_url: product.image_url || '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        price_small: form.price_small ? Number(form.price_small) : null,
        price_medium: form.price_medium ? Number(form.price_medium) : null,
        price_large: form.price_large ? Number(form.price_large) : null,
        image_url: form.image_url || null,
      };

      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          setShowModal(false);
          fetchData();
        }
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product: Product) {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p)),
        );
      }
    } catch {
      // silently fail
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function getCategoryName(categoryId: number | null): string {
    if (!categoryId) return '-';
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : '-';
  }

  function formatPrice(value: number | null): string {
    if (value == null) return '-';
    return `R$ ${Number(value).toFixed(2)}`;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Produtos</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button
            onClick={openNew}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Novo Produto
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-400">Nenhum produto encontrado</p>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800 text-left text-gray-400">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Preco P</th>
                <th className="px-4 py-3 text-right">Preco M</th>
                <th className="px-4 py-3 text-right">Preco G</th>
                <th className="px-4 py-3 text-center">Ativo</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-700/50 ${
                    idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20'
                  }`}
                >
                  <td className="px-4 py-3 text-white">{product.name}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {product.category_name || getCategoryName(product.category_id)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {formatPrice(product.price_small)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {formatPrice(product.price_medium)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {formatPrice(product.price_large)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        product.active
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="rounded bg-gray-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-500"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActive(product)}
                        className={`rounded px-3 py-1 text-xs font-medium text-white transition-colors ${
                          product.active
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {product.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-gray-800 p-6 ring-1 ring-gray-700">
            <h2 className="mb-4 text-lg font-bold text-white">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Descricao</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Categoria</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Preco P</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price_small}
                    onChange={(e) => setForm({ ...form, price_small: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Preco M</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price_medium}
                    onChange={(e) => setForm({ ...form, price_medium: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Preco G</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price_large}
                    onChange={(e) => setForm({ ...form, price_large: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">URL da imagem</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
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
