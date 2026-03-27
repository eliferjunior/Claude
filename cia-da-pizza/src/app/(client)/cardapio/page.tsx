'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

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

const categoryIcons: Record<string, string> = {
  pizza: '🍕',
  pizzas: '🍕',
  sanduiche: '🥪',
  sanduiches: '🥪',
  bebida: '🥤',
  bebidas: '🥤',
  sobremesa: '🍰',
  sobremesas: '🍰',
  salgado: '🥟',
  salgados: '🥟',
  porcao: '🍟',
  porcoes: '🍟',
  combo: '🎁',
  combos: '🎁',
  promocao: '🔥',
  promocoes: '🔥',
};

function getCategoryIcon(name: string): string {
  const lower = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon;
  }
  return '🍽️';
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

  // The first 5 products (by original order) are considered "Mais Vendidos"
  const topSellerIds = useMemo(() => {
    return new Set(products.slice(0, 5).map((p) => p.id));
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className="mt-4 text-gray-400 text-lg">Carregando cardapio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-16 pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
            Nosso Cardapio
          </h1>
          <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
            Escolha entre nossas deliciosas opcoes de pizzas, sanduiches e muito mais
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto animate-slide-up delay-100">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
              className="w-full bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all outline-none"
            />
          </div>
        </div>

        {/* Category Pills - horizontal scroll on mobile */}
        <div className="mb-10 animate-slide-up delay-200">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center sm:flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/25'
                  : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span>🍽️</span>
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/25'
                    : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <span>{getCategoryIcon(cat.name)}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-gray-400 text-lg">Nenhum produto encontrado.</p>
            <p className="text-gray-500 text-sm mt-2">Tente buscar por outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 group flex flex-col"
              >
                {/* Image placeholder with gradient */}
                <div className="h-44 bg-gradient-to-br from-red-900/30 via-gray-800 to-yellow-900/20 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-xs font-semibold text-red-300 bg-red-500/20 border border-red-500/30 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      {product.category_name}
                    </span>
                    {topSellerIds.has(product.id) && (
                      <span className="text-xs font-bold text-yellow-200 bg-yellow-500/20 border border-yellow-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Mais Vendido
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white drop-shadow-lg">{product.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {product.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Prices - more prominent */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.price_small !== null && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900/50 border border-gray-700/50 px-3 py-2">
                        <span className="font-bold text-red-400 text-sm">P</span>
                        <span className="text-yellow-400 font-extrabold text-lg">
                          {formatPrice(product.price_small)}
                        </span>
                      </span>
                    )}
                    {product.price_medium !== null && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900/50 border border-gray-700/50 px-3 py-2">
                        <span className="font-bold text-red-400 text-sm">M</span>
                        <span className="text-yellow-400 font-extrabold text-lg">
                          {formatPrice(product.price_medium)}
                        </span>
                      </span>
                    )}
                    {product.price_large !== null && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900/50 border border-gray-700/50 px-3 py-2">
                        <span className="font-bold text-red-400 text-sm">G</span>
                        <span className="text-yellow-400 font-extrabold text-lg">
                          {formatPrice(product.price_large)}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Pedir button */}
                  <div className="mt-auto">
                    <Link
                      href="/pedido"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-2.5 px-4 transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-red-500/30 hover:scale-[1.02] text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                        />
                      </svg>
                      Pedir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating CTA Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md border-t border-gray-700/50 shadow-2xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-gray-300 text-sm sm:text-base font-medium hidden sm:block">
              Gostou do nosso cardapio? Faca seu pedido agora!
            </p>
            <p className="text-gray-300 text-sm font-medium sm:hidden">Faca seu pedido!</p>
            <Link
              href="/pedido"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 px-6 transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              Fazer Pedido
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
