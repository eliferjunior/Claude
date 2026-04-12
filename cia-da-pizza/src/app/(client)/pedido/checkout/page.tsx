'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

const steps = ['Loja', 'Tipo', 'Cardapio', 'Finalizar'];

const paymentMethods = [
  { value: 'pix', label: 'PIX', icon: '📱' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartao Credito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartao Debito', icon: '💳' },
];

function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    selectedStore,
    orderType,
    cart,
    cartSubtotal,
    cartTotal,
    deliveryFee,
    customerName,
    customerPhone,
    customerEmail,
    addressStreet,
    addressNumber,
    addressComplement,
    addressNeighborhood,
    paymentMethod,
    changeFor,
    notes,
    setCustomerData,
    setPaymentData,
    setOrderId,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  // Load saved customer data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cia_pizza_customer');
      if (saved) {
        const data = JSON.parse(saved);
        const updates: Record<string, string> = {};
        if (data.customerName && !customerName) updates.customerName = data.customerName;
        if (data.customerPhone && !customerPhone) updates.customerPhone = data.customerPhone;
        if (data.customerEmail && !customerEmail) updates.customerEmail = data.customerEmail;
        if (data.addressStreet && !addressStreet) updates.addressStreet = data.addressStreet;
        if (data.addressNumber && !addressNumber) updates.addressNumber = data.addressNumber;
        if (data.addressComplement && !addressComplement)
          updates.addressComplement = data.addressComplement;
        if (data.addressNeighborhood && !addressNeighborhood)
          updates.addressNeighborhood = data.addressNeighborhood;
        if (Object.keys(updates).length > 0) setCustomerData(updates);
      }
    } catch {
      // ignore
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (!selectedStore || !orderType || cart.length === 0) {
      router.replace('/pedido');
    }
  }, [selectedStore, orderType, cart, router]);

  if (!selectedStore || !orderType || cart.length === 0) {
    return null;
  }

  const isDelivery = orderType === 'delivery';

  const canSubmit =
    customerName.trim() !== '' &&
    paymentMethod !== '' &&
    lgpdConsent &&
    (!isDelivery ||
      (addressStreet.trim() !== '' &&
        addressNumber.trim() !== '' &&
        addressNeighborhood.trim() !== ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError('');

    const customerAddress = isDelivery
      ? `${addressStreet}, ${addressNumber}${addressComplement ? ` - ${addressComplement}` : ''} - ${addressNeighborhood}`
      : undefined;

    const body = {
      store_id: selectedStore.id,
      customer_name: customerName,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
      customer_address: customerAddress || null,
      order_type: orderType,
      payment_method: paymentMethod,
      change_for: paymentMethod === 'dinheiro' ? parseFloat(changeFor) || 0 : 0,
      notes: notes || null,
      items: cart.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        borda: item.borda || null,
        borda_price: item.borda_price || 0,
      })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao enviar pedido');
      }

      const data = await res.json();
      setOrderId(data.id ?? data.orderId ?? data.order_id);

      // Save customer data for next order
      try {
        localStorage.setItem(
          'cia_pizza_customer',
          JSON.stringify({
            customerName,
            customerPhone,
            customerEmail,
            addressStreet,
            addressNumber,
            addressComplement,
            addressNeighborhood,
          }),
        );
      } catch {
        // ignore
      }

      router.push('/pedido/confirmacao');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar pedido';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Progress Bar */}
      <div className="w-full px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i + 1 <= 4 ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${i + 1 <= 4 ? 'text-red-400' : 'text-gray-500'}`}>
                    {step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-12px] ${
                      i + 1 < 4 ? 'bg-red-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pb-6 text-center">
        <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
        <p className="text-gray-400 mt-1">Preencha seus dados para concluir</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 pb-8 space-y-6">
        {/* Customer Data */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-red-400">Dados do Cliente</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerData({ customerName: e.target.value })}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Telefone</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerData({ customerPhone: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="(16) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">E-mail</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerData({ customerEmail: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        {/* Address (delivery only) */}
        {isDelivery && (
          <div className="bg-gray-900 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-red-400">Endereco de Entrega</h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Rua *</label>
                <input
                  type="text"
                  value={addressStreet}
                  onChange={(e) => setCustomerData({ addressStreet: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Nome da rua"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Numero *</label>
                <input
                  type="text"
                  value={addressNumber}
                  onChange={(e) => setCustomerData({ addressNumber: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Complemento</label>
                <input
                  type="text"
                  value={addressComplement}
                  onChange={(e) => setCustomerData({ addressComplement: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Apto, bloco..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bairro *</label>
                <input
                  type="text"
                  value={addressNeighborhood}
                  onChange={(e) => setCustomerData({ addressNeighborhood: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Bairro"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-red-400">Pagamento</h2>

          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentData({ paymentMethod: method.value })}
                className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                  paymentMethod === method.value
                    ? 'border-red-600 bg-red-600/10 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{method.icon}</div>
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            ))}
          </div>

          {paymentMethod === 'dinheiro' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Troco para quanto?</label>
              <input
                type="text"
                value={changeFor}
                onChange={(e) => setPaymentData({ changeFor: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                placeholder="Ex: 50,00"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-red-400">Observacoes</h2>
          <textarea
            value={notes}
            onChange={(e) => setPaymentData({ notes: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors resize-none"
            placeholder="Alguma observacao sobre o pedido?"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-red-400">Resumo do Pedido</h2>

          <div className="space-y-3">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <span className="text-white">
                    {item.quantity}x {item.product_name} ({item.size})
                  </span>
                  {item.borda && (
                    <span className="block text-gray-500 text-xs">
                      Borda: {item.borda} (+{formatPrice(item.borda_price ?? 0)})
                    </span>
                  )}
                </div>
                <span className="text-gray-300 ml-3">
                  {formatPrice((item.unit_price + (item.borda_price ?? 0)) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between text-sm text-gray-400">
                <span>Taxa de entrega</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span className="text-red-400">{formatPrice(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* LGPD Consent */}
        <div className="bg-gray-900 rounded-xl p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={lgpdConsent}
              onChange={(e) => setLgpdConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-0 shrink-0"
            />
            <span className="text-sm text-gray-400">
              Li e concordo com a{' '}
              <Link
                href="/politica-privacidade"
                target="_blank"
                className="text-red-400 hover:underline font-medium"
              >
                Politica de Privacidade
              </Link>{' '}
              e autorizo o uso dos meus dados para processamento do pedido, conforme a LGPD.
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
              canSubmit && !submitting
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Enviando...' : 'Finalizar Pedido'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/pedido/cardapio')}
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}
