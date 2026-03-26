'use client';

import { useState, useEffect, useMemo } from 'react';

interface Category {
  id: number;
  name: string;
  order_position: number;
}

interface Product {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description: string | null;
  price_small: number | null;
  price_medium: number | null;
  price_large: number | null;
  image_url: string | null;
  active: number;
}

function formatPrice(value: number | null): string {
  if (value === null || value === undefined) return '';
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

export default function CardapioPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?active=1'),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(catData);
        setProducts(prodData);
      } catch (error) {
        console.error('Erro ao carregar cardapio:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCategory !== null) {
      result = result.filter((p) => p.category_id === selectedCategory);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)),
      );
    }
    return result;
  }, [products, selectedCategory, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="mt-4 text-gray-400 text-lg">Carregando cardapio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Nosso Cardapio</h1>
          <p className="mt-3 text-gray-400 text-lg">
            Escolha entre nossas deliciosas opcoes de pizzas, sanduiches e muito mais
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no cardapio..."
              className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              selectedCategory === null
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-xl p-5 hover:ring-2 ring-red-500 transition duration-200"
              >
                <div className="mb-1">
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wide">
                    {product.category_name}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {product.price_small !== null && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-sm">
                      <span className="font-semibold text-red-400">P:</span>
                      <span className="text-white">{formatPrice(product.price_small)}</span>
                    </span>
                  )}
                  {product.price_medium !== null && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-sm">
                      <span className="font-semibold text-red-400">M:</span>
                      <span className="text-white">{formatPrice(product.price_medium)}</span>
                    </span>
                  )}
                  {product.price_large !== null && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-sm">
                      <span className="font-semibold text-red-400">G:</span>
                      <span className="text-white">{formatPrice(product.price_large)}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
