'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart, CartItem } from '@/contexts/CartContext';
import FloatingCart from '@/components/FloatingCart';
import AddToCartToast, { useCartToast } from '@/components/AddToCartToast';

const STEPS = ['Loja', 'Tipo', 'Cardapio', 'Checkout'];

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

type Size = 'P' | 'M' | 'G';

const BORDA_OPTIONS = [
  { value: 'sem', label: 'Sem Borda' },
  { value: 'catupiry', label: 'Catupiry' },
  { value: 'cheddar', label: 'Cheddar' },
  { value: 'chocolate', label: 'Chocolate' },
];

function getBordaPrice(borda: string, size: Size): number {
  if (borda === 'sem') return 0;
  if (size === 'P') return 8;
  if (size === 'M') return 10;
  return 12;
}

function isBordaFree(size: Size): boolean {
  if (size !== 'G') return false;
  const day = new Date().getDay();
  return day >= 1 && day <= 4;
}

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getCategoryEmoji(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes('pizza')) return '\u{1F355}';
  if (lower.includes('bebida') || lower.includes('drink')) return '\u{1F964}';
  if (lower.includes('sobremesa') || lower.includes('doce')) return '\u{1F370}';
  if (lower.includes('lanche') || lower.includes('burger') || lower.includes('hambur'))
    return '\u{1F354}';
  if (lower.includes('salada')) return '\u{1F957}';
  if (lower.includes('massa') || lower.includes('pasta')) return '\u{1F35D}';
  if (lower.includes('entrada') || lower.includes('porco') || lower.includes('porção'))
    return '\u{1F35F}';
  return '\u{1F374}';
}

function isPizzaCategory(categoryName: string): boolean {
  return categoryName.toLowerCase().includes('pizza');
}

interface ProductCardState {
  size: Size | null;
  borda: string;
  quantity: number;
}

export default function CardapioPage() {
  const router = useRouter();
  const {
    selectedStore,
    orderType,
    cart,
    addToCart,
    removeFromCart,
    cartTotal,
    cartSubtotal,
    cartItemCount,
  } = useCart();
  const { toasts, showToast } = useCartToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cardStates, setCardStates] = useState<Record<number, ProductCardState>>({});

  // 2 sabores modal state
  const [showDoisSabores, setShowDoisSabores] = useState(false);
  const [doisSaboresSelections, setDoisSaboresSelections] = useState<number[]>([]);
  const [doisSaboresBorda, setDoisSaboresBorda] = useState('sem');
  const [doisSaboresQuantity, setDoisSaboresQuantity] = useState(1);

  useEffect(() => {
    if (!selectedStore || !orderType) {
      router.replace('/pedido');
    }
  }, [selectedStore, orderType, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?active=1'),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === null) return products;
    return products.filter((p) => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  const pizzaProducts = useMemo(() => {
    return products.filter((p) => isPizzaCategory(p.category_name) && p.price_large !== null);
  }, [products]);

  function getCardState(productId: number): ProductCardState {
    return cardStates[productId] ?? { size: null, borda: 'sem', quantity: 1 };
  }

  function updateCardState(productId: number, update: Partial<ProductCardState>) {
    setCardStates((prev) => ({
      ...prev,
      [productId]: { ...getCardState(productId), ...update },
    }));
  }

  function getAvailableSizes(product: Product): { size: Size; price: number }[] {
    const sizes: { size: Size; price: number }[] = [];
    if (product.price_small !== null) sizes.push({ size: 'P', price: product.price_small });
    if (product.price_medium !== null) sizes.push({ size: 'M', price: product.price_medium });
    if (product.price_large !== null) sizes.push({ size: 'G', price: product.price_large });
    return sizes;
  }

  function getSizePrice(product: Product, size: Size): number {
    if (size === 'P') return product.price_small ?? 0;
    if (size === 'M') return product.price_medium ?? 0;
    return product.price_large ?? 0;
  }

  function handleAddToCart(product: Product) {
    const state = getCardState(product.id);
    if (!state.size) return;

    // Pizza Grande -> 2 sabores modal
    if (isPizzaCategory(product.category_name) && state.size === 'G') {
      setDoisSaboresSelections([product.id]);
      setDoisSaboresBorda(state.borda);
      setDoisSaboresQuantity(state.quantity);
      setShowDoisSabores(true);
      return;
    }

    const unitPrice = getSizePrice(product, state.size);
    const isPizza = isPizzaCategory(product.category_name);
    const bordaPrice =
      isPizza && state.borda !== 'sem'
        ? isBordaFree(state.size)
          ? 0
          : getBordaPrice(state.borda, state.size)
        : 0;

    const item: CartItem = {
      product_id: product.id,
      product_name: product.name,
      size: state.size,
      quantity: state.quantity,
      unit_price: unitPrice,
      ...(isPizza && state.borda !== 'sem' ? { borda: state.borda, borda_price: bordaPrice } : {}),
    };

    addToCart(item);
    showToast(product.name);
    updateCardState(product.id, { size: null, borda: 'sem', quantity: 1 });
  }

  function handleDoisSaboresConfirm() {
    if (doisSaboresSelections.length !== 2) return;

    const p1 = products.find((p) => p.id === doisSaboresSelections[0]);
    const p2 = products.find((p) => p.id === doisSaboresSelections[1]);
    if (!p1 || !p2) return;

    const price1 = p1.price_large ?? 0;
    const price2 = p2.price_large ?? 0;
    const unitPrice = Math.max(price1, price2);

    const bordaPrice =
      doisSaboresBorda !== 'sem'
        ? isBordaFree('G')
          ? 0
          : getBordaPrice(doisSaboresBorda, 'G')
        : 0;

    const item: CartItem = {
      product_id: p1.id,
      product_name: `${p1.name} / ${p2.name}`,
      size: 'G',
      quantity: doisSaboresQuantity,
      unit_price: unitPrice,
      ...(doisSaboresBorda !== 'sem' ? { borda: doisSaboresBorda, borda_price: bordaPrice } : {}),
    };

    addToCart(item);
    showToast(`${p1.name} / ${p2.name}`);
    setShowDoisSabores(false);
    setDoisSaboresSelections([]);
    setDoisSaboresBorda('sem');
    setDoisSaboresQuantity(1);
  }

  function toggleDoisSaboresSelection(productId: number) {
    setDoisSaboresSelections((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 2) {
        return [prev[1], productId];
      }
      return [...prev, productId];
    });
  }

  if (!selectedStore || !orderType) return null;

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

  const currentStep = 3;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-40">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {selectedStore.name}
              </h2>
              <span
                className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  orderType === 'delivery'
                    ? 'bg-red-600/20 text-red-400'
                    : 'bg-yellow-600/20 text-yellow-400'
                }`}
              >
                {orderType === 'delivery' ? 'Entrega' : 'Retirada'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-red-400 font-bold">{formatPrice(cartSubtotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => {
              const stepNum = i + 1;
              const isCompleted = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div key={label} className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-bold transition-colors ${
                      isCompleted || isCurrent
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
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
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={`mt-1 text-xs sm:text-sm text-center ${
                      isCompleted || isCurrent ? 'text-red-400 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-0 mt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full mx-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentStep > s
                      ? 'bg-red-600'
                      : currentStep === s
                        ? 'bg-red-600/50'
                        : 'bg-gray-700'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Cardapio</h1>
          <p className="mt-1 text-gray-400 text-sm sm:text-base">
            Escolha seus produtos e adicione ao carrinho
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 -mx-3 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto px-3 sm:px-0 pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === null
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const state = getCardState(product.id);
              const availableSizes = getAvailableSizes(product);
              const isPizza = isPizzaCategory(product.category_name);
              const selectedSizePrice = state.size ? getSizePrice(product, state.size) : null;
              const bordaPrice =
                isPizza && state.size && state.borda !== 'sem'
                  ? isBordaFree(state.size)
                    ? 0
                    : getBordaPrice(state.borda, state.size)
                  : 0;
              const itemTotal =
                selectedSizePrice !== null
                  ? (selectedSizePrice + bordaPrice) * state.quantity
                  : null;

              return (
                <div
                  key={product.id}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gray-700/50 flex items-center justify-center">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="text-5xl">{getCategoryEmoji(product.category_name)}</span>
                    )}
                    <span className="absolute top-2 left-2 bg-gray-900/80 text-xs font-semibold text-gray-300 px-2 py-1 rounded-lg">
                      {product.category_name}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-white">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Size Selector */}
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1.5">Tamanho</p>
                      <div className="flex gap-2">
                        {availableSizes.map(({ size, price }) => (
                          <button
                            key={size}
                            onClick={() => updateCardState(product.id, { size, borda: 'sem' })}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              state.size === size
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <span className="block">{size}</span>
                            <span className="block text-xs mt-0.5 opacity-80">
                              {formatPrice(price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Borda Selector (pizza only, when size selected) */}
                    {isPizza && state.size && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1.5">
                          Borda
                          {isBordaFree(state.size) && (
                            <span className="ml-1 text-green-400 font-semibold">
                              (gratis hoje!)
                            </span>
                          )}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {BORDA_OPTIONS.map((opt) => {
                            const bPrice =
                              opt.value !== 'sem'
                                ? isBordaFree(state.size!)
                                  ? 0
                                  : getBordaPrice(opt.value, state.size!)
                                : 0;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => updateCardState(product.id, { borda: opt.value })}
                                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                                  state.borda === opt.value
                                    ? 'bg-red-600/20 text-red-400 ring-1 ring-red-600'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {opt.label}
                                {bPrice > 0 && (
                                  <span className="block text-[10px] opacity-70 mt-0.5">
                                    +{formatPrice(bPrice)}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quantity + Add */}
                    <div className="mt-auto pt-3">
                      <div className="flex items-center justify-between gap-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCardState(product.id, {
                                quantity: Math.max(1, state.quantity - 1),
                              })
                            }
                            className="w-8 h-8 rounded-lg bg-gray-700 text-white font-bold flex items-center justify-center hover:bg-gray-600 transition"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-6 text-center">
                            {state.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCardState(product.id, { quantity: state.quantity + 1 })
                            }
                            className="w-8 h-8 rounded-lg bg-gray-700 text-white font-bold flex items-center justify-center hover:bg-gray-600 transition"
                          >
                            +
                          </button>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!state.size}
                          className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {itemTotal !== null ? (
                            <>Adicionar {formatPrice(itemTotal)}</>
                          ) : (
                            'Adicionar'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2 Sabores Modal */}
      {showDoisSabores && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowDoisSabores(false)}
          />
          <div className="fixed inset-x-4 top-[5%] bottom-[5%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Pizza Grande - 2 Sabores</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Selecione 2 sabores. O preco sera o do sabor mais caro.
                </p>
              </div>
              <button
                onClick={() => setShowDoisSabores(false)}
                className="p-1 text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Pizza List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {pizzaProducts.map((p) => {
                const isSelected = doisSaboresSelections.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleDoisSaboresSelection(p.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-red-600/20 ring-1 ring-red-600'
                        : 'bg-gray-700/50 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl shrink-0">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        '\u{1F355}'
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 truncate">{p.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-red-400 shrink-0">
                      {formatPrice(p.price_large ?? 0)}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-red-400 shrink-0"
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
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Borda */}
            <div className="px-4 py-3 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-1.5">
                Borda
                {isBordaFree('G') && (
                  <span className="ml-1 text-green-400 font-semibold">(gratis hoje!)</span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {BORDA_OPTIONS.map((opt) => {
                  const bPrice =
                    opt.value !== 'sem'
                      ? isBordaFree('G')
                        ? 0
                        : getBordaPrice(opt.value, 'G')
                      : 0;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDoisSaboresBorda(opt.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                        doisSaboresBorda === opt.value
                          ? 'bg-red-600/20 text-red-400 ring-1 ring-red-600'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {opt.label}
                      {bPrice > 0 && (
                        <span className="block text-[10px] opacity-70 mt-0.5">
                          +{formatPrice(bPrice)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Quantity + Confirm */}
            <div className="px-4 py-3 border-t border-gray-700">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDoisSaboresQuantity(Math.max(1, doisSaboresQuantity - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-700 text-white font-bold flex items-center justify-center hover:bg-gray-600 transition"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{doisSaboresQuantity}</span>
                  <button
                    onClick={() => setDoisSaboresQuantity(doisSaboresQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-700 text-white font-bold flex items-center justify-center hover:bg-gray-600 transition"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleDoisSaboresConfirm}
                  disabled={doisSaboresSelections.length !== 2}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {doisSaboresSelections.length === 2
                    ? (() => {
                        const p1 = products.find((p) => p.id === doisSaboresSelections[0]);
                        const p2 = products.find((p) => p.id === doisSaboresSelections[1]);
                        const price = Math.max(p1?.price_large ?? 0, p2?.price_large ?? 0);
                        const borda =
                          doisSaboresBorda !== 'sem'
                            ? isBordaFree('G')
                              ? 0
                              : getBordaPrice(doisSaboresBorda, 'G')
                            : 0;
                        return `Adicionar ${formatPrice((price + borda) * doisSaboresQuantity)}`;
                      })()
                    : `Selecione ${2 - doisSaboresSelections.length} sabor(es)`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/pedido/tipo')}
            className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-semibold"
          >
            Voltar
          </button>
          <button
            onClick={() => router.push('/pedido/checkout')}
            disabled={cartItemCount === 0}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Proximo</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Cart */}
      <FloatingCart
        items={cart}
        total={cartTotal}
        onRemove={removeFromCart}
        onAdvance={() => router.push('/pedido/checkout')}
        canAdvance={cartItemCount > 0}
      />

      {/* Toast */}
      <AddToCartToast toasts={toasts} />
    </div>
  );
}
