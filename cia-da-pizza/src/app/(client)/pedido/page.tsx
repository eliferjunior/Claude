'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { generateWhatsAppOrderLink } from '@/lib/notifications';
import FloatingCart from '@/components/FloatingCart';
import AddToCartToast, { useCartToast } from '@/components/AddToCartToast';

interface Store {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  allows_delivery: number;
  allows_pickup: number;
  allows_dine_in: number;
  active: number;
}

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

interface CartItem {
  product_id: number;
  product_name: string;
  size: 'P' | 'M' | 'G';
  quantity: number;
  unit_price: number;
}

type OrderType = 'delivery' | 'pickup' | 'dine_in';

function formatPrice(value: number | null): string {
  if (value === null || value === undefined) return '';
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

const STEP_LABELS = ['Escolha a Loja', 'Monte seu Pedido', 'Seus Dados', 'Confirmado'];

export default function PedidoPage() {
  const [step, setStep] = useState(1);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Step 1
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [orderType, setOrderType] = useState<OrderType | null>(null);

  // Step 2
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, 'P' | 'M' | 'G'>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // Toast
  const { toasts, showToast } = useCartToast();

  // Step 3
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Step 4
  const [orderId, setOrderId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('/api/stores?active=1');
        const data = await res.json();
        setStores(data);
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    if (step === 2 && categories.length === 0) {
      const fetchMenu = async () => {
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
        }
      };
      fetchMenu();
    }
  }, [step, categories.length]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === null) return products;
    return products.filter((p) => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  }, [cart]);

  function getAvailableSizes(product: Product): ('P' | 'M' | 'G')[] {
    const sizes: ('P' | 'M' | 'G')[] = [];
    if (product.price_small !== null) sizes.push('P');
    if (product.price_medium !== null) sizes.push('M');
    if (product.price_large !== null) sizes.push('G');
    return sizes;
  }

  function getSizePrice(product: Product, size: 'P' | 'M' | 'G'): number {
    if (size === 'P') return product.price_small ?? 0;
    if (size === 'M') return product.price_medium ?? 0;
    return product.price_large ?? 0;
  }

  function addToCart(product: Product) {
    const sizes = getAvailableSizes(product);
    if (sizes.length === 0) return;

    const size = selectedSizes[product.id] || sizes[0];
    const qty = quantities[product.id] || 1;
    const price = getSizePrice(product, size);

    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.id && item.size === size,
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += qty;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          size,
          quantity: qty,
          unit_price: price,
        },
      ]);
    }

    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));

    // Visual feedback
    showToast(product.name);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 600);
  }

  function removeFromCart(index: number) {
    setCart(cart.filter((_, i) => i !== index));
  }

  async function submitOrder() {
    if (!selectedStore || !orderType) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: selectedStore.id,
          customer_name: customerName,
          customer_phone: customerPhone || null,
          customer_email: customerEmail || null,
          customer_address: orderType === 'delivery' ? customerAddress : null,
          order_type: orderType,
          notes: notes || null,
          items: cart.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao enviar pedido');
      }

      const data = await res.json();
      setOrderId(Number(data.id));
      setStep(4);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  }

  function resetOrder() {
    setStep(1);
    setSelectedStore(null);
    setOrderType(null);
    setCart([]);
    setSelectedCategory(null);
    setSelectedSizes({});
    setQuantities({});
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setNotes('');
    setOrderId(null);
    setSubmitError('');
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

  return (
    <div className="min-h-screen bg-gray-900 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Fazer Pedido
          </h1>
          <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-lg">
            Siga os passos abaixo para montar seu pedido
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isCompleted = step > stepNum;
              const isCurrent = step === stepNum;
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
                    step > s ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 - Escolha a Loja */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">Escolha a Loja</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setOrderType(null);
                  }}
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

            {selectedStore && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Tipo de Pedido</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedStore.allows_delivery === 1 && (
                    <button
                      onClick={() => setOrderType('delivery')}
                      className={`rounded-xl px-5 py-3 font-semibold transition-all ${
                        orderType === 'delivery'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Entrega
                    </button>
                  )}
                  {selectedStore.allows_pickup === 1 && (
                    <button
                      onClick={() => setOrderType('pickup')}
                      className={`rounded-xl px-5 py-3 font-semibold transition-all ${
                        orderType === 'pickup'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Retirada
                    </button>
                  )}
                  {selectedStore.allows_dine_in === 1 && (
                    <button
                      onClick={() => setOrderType('dine_in')}
                      className={`rounded-xl px-5 py-3 font-semibold transition-all ${
                        orderType === 'dine_in'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Consumo Local
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedStore || !orderType}
                className="rounded-xl bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proximo
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Monte seu Pedido */}
        {step === 2 && (
          <div className="pb-24">
            {/* Toast notifications */}
            <AddToCartToast toasts={toasts} />

            {/* Floating Cart */}
            <FloatingCart
              items={cart}
              total={cartTotal}
              onRemove={removeFromCart}
              onAdvance={() => setStep(3)}
              canAdvance={cart.length > 0}
            />

            <h2 className="text-xl font-bold text-white mb-6">Monte seu Pedido</h2>

            {/* Category Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 rounded-full px-4 sm:px-5 py-2 text-sm font-semibold transition ${
                  selectedCategory === null
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full px-4 sm:px-5 py-2 text-sm font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product Cards */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const sizes = getAvailableSizes(product);
                  if (sizes.length === 0) return null;
                  const currentSize = selectedSizes[product.id] || sizes[0];
                  const currentQty = quantities[product.id] || 1;
                  const currentPrice = getSizePrice(product, currentSize);
                  const justAdded = addedProductId === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`bg-gray-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
                        justAdded ? 'ring-2 ring-green-500 scale-[1.02]' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div className="h-36 relative bg-gradient-to-br from-red-900/30 via-gray-800 to-yellow-900/20">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl opacity-30">
                              {product.category_name.toLowerCase().includes('pizza') ? '🍕' :
                               product.category_name.toLowerCase().includes('hamb') ? '🍔' :
                               product.category_name.toLowerCase().includes('bebida') ? '🥤' :
                               product.category_name.toLowerCase().includes('sobremesa') ? '🍰' :
                               product.category_name.toLowerCase().includes('porç') ? '🍟' : '🍽️'}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent" />
                        <span className="absolute top-2 left-2 text-xs font-medium text-red-300 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-lg">
                          {product.category_name}
                        </span>

                        {/* Added animation overlay */}
                        {justAdded && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="bg-green-500 rounded-full p-2">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-white mb-0.5">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Size Selector */}
                        <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none">
                          {sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() =>
                                setSelectedSizes((prev) => ({ ...prev, [product.id]: size }))
                              }
                              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                currentSize === size
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {size} - {formatPrice(getSizePrice(product, size))}
                            </button>
                          ))}
                        </div>

                        {/* Quantity + Add */}
                        <div className="flex items-center gap-2 mt-auto">
                          <div className="flex items-center bg-gray-700 rounded-lg">
                            <button
                              onClick={() =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: Math.max(1, (prev[product.id] || 1) - 1),
                                }))
                              }
                              className="px-2.5 py-1.5 text-white font-bold hover:bg-gray-600 rounded-l-lg transition text-sm"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1.5 text-white font-semibold min-w-[1.75rem] text-center text-sm">
                              {currentQty}
                            </span>
                            <button
                              onClick={() =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: (prev[product.id] || 1) + 1,
                                }))
                              }
                              className="px-2.5 py-1.5 text-white font-bold hover:bg-gray-600 rounded-r-lg transition text-sm"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700 transition flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Adicionar
                          </button>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-1.5">
                          Subtotal: {formatPrice(currentPrice * currentQty)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 shadow-2xl">
              <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-xl bg-gray-700 px-4 sm:px-6 py-2.5 font-bold text-white hover:bg-gray-600 transition text-sm"
                >
                  Voltar
                </button>

                <div className="flex items-center gap-3">
                  {cart.length > 0 && (
                    <span className="text-sm text-gray-400 hidden sm:block">
                      {cart.reduce((s, i) => s + i.quantity, 0)} itens - {formatPrice(cartTotal)}
                    </span>
                  )}
                  <button
                    onClick={() => setStep(3)}
                    disabled={cart.length === 0}
                    className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 sm:px-8 py-2.5 font-bold text-white hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
                  >
                    <span>Proximo</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Seus Dados */}
        {step === 3 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">Seus Dados</h2>

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
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  E-mail{' '}
                  <span className="text-gray-500 font-normal">
                    (opcional - para receber atualizacoes)
                  </span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {orderType === 'delivery' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">
                    Endereco de Entrega *
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Rua, numero, bairro"
                    className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Observacoes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma observacao sobre o pedido?"
                  rows={3}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 bg-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-3">Resumo do Pedido</h3>
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product_id}-${item.size}-${index}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-300">
                      {item.product_name} ({item.size}) x{item.quantity}
                    </span>
                    <span className="text-white font-semibold">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-red-400 font-bold text-lg">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
                {submitError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 sm:mt-8 gap-3">
              <button
                onClick={() => setStep(2)}
                className="rounded-xl bg-gray-700 px-5 sm:px-8 py-3 font-bold text-white hover:bg-gray-600 transition text-sm sm:text-base"
              >
                Voltar
              </button>
              <button
                onClick={submitOrder}
                disabled={
                  submitting ||
                  !customerName.trim() ||
                  (orderType === 'delivery' && !customerAddress.trim())
                }
                className="rounded-xl bg-red-600 px-5 sm:px-8 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {submitting ? 'Enviando...' : 'Finalizar Pedido'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Pedido Confirmado */}
        {step === 4 && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2">Pedido Confirmado!</h2>
              <p className="text-gray-400 mb-4">Seu pedido foi recebido com sucesso.</p>

              {orderId && (
                <div className="bg-gray-700 rounded-xl p-4 mb-6 inline-block">
                  <p className="text-sm text-gray-400">Numero do Pedido</p>
                  <p className="text-3xl font-extrabold text-red-400">#{orderId}</p>
                </div>
              )}

              <div className="bg-gray-700 rounded-xl p-4 mb-4 text-left">
                <p className="text-sm text-gray-400 mb-2">Resumo</p>
                <div className="space-y-1">
                  {cart.map((item, i) => (
                    <div
                      key={`confirm-${item.product_id}-${item.size}-${i}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-300">
                        {item.product_name} ({item.size}) x{item.quantity}
                      </span>
                      <span className="text-white">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-600 flex justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-red-400 text-lg">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href={generateWhatsAppOrderLink({
                  orderId,
                  customerName,
                  customerPhone,
                  customerAddress: orderType === 'delivery' ? customerAddress : undefined,
                  orderType: orderType || 'delivery',
                  items: cart.map((item) => ({
                    product_name: item.product_name,
                    size: item.size,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                  })),
                  total: cartTotal,
                  notes: notes || undefined,
                  storeName: selectedStore?.name,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 px-8 py-3 font-bold text-white hover:bg-green-700 transition mb-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar Pedido via WhatsApp
              </a>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/acompanhar"
                  className="rounded-xl bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700 transition text-center"
                >
                  Acompanhar Pedido
                </Link>
                <button
                  onClick={resetOrder}
                  className="rounded-xl bg-gray-700 px-8 py-3 font-bold text-white hover:bg-gray-600 transition"
                >
                  Novo Pedido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
