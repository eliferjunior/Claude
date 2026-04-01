import { describe, it, expect } from 'vitest';

// --- Pure logic extracted from src/app/api/orders/route.ts ---

const VALID_PAYMENT_METHODS = ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito'];

function isValidPaymentMethod(method: string): boolean {
  return VALID_PAYMENT_METHODS.includes(method);
}

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(Math.floor(quantity), 99));
}

function calculateTotal(
  items: { unit_price: number; quantity: number }[],
  deliveryFee: number = 0,
): number {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.quantity * item.unit_price;
  }
  subtotal = Math.round(subtotal * 100) / 100;
  return Math.round((subtotal + deliveryFee) * 100) / 100;
}

function formatPrice(value: number | null): string {
  if (value === null || value === undefined) return '';
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

// --- Tests ---

describe('payment method validation', () => {
  it('accepts pix', () => {
    expect(isValidPaymentMethod('pix')).toBe(true);
  });

  it('accepts dinheiro', () => {
    expect(isValidPaymentMethod('dinheiro')).toBe(true);
  });

  it('accepts cartao_credito', () => {
    expect(isValidPaymentMethod('cartao_credito')).toBe(true);
  });

  it('accepts cartao_debito', () => {
    expect(isValidPaymentMethod('cartao_debito')).toBe(true);
  });

  it('rejects invalid payment method', () => {
    expect(isValidPaymentMethod('bitcoin')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidPaymentMethod('')).toBe(false);
  });
});

describe('quantity clamping', () => {
  it('clamps quantity below 1 to 1', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-5)).toBe(1);
  });

  it('clamps quantity above 99 to 99', () => {
    expect(clampQuantity(100)).toBe(99);
    expect(clampQuantity(999)).toBe(99);
  });

  it('floors fractional quantities', () => {
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(5.99)).toBe(5);
  });

  it('keeps valid quantities unchanged', () => {
    expect(clampQuantity(1)).toBe(1);
    expect(clampQuantity(50)).toBe(50);
    expect(clampQuantity(99)).toBe(99);
  });
});

describe('price calculation', () => {
  it('calculates subtotal for single item', () => {
    const items = [{ unit_price: 25.0, quantity: 2 }];
    expect(calculateTotal(items)).toBe(50.0);
  });

  it('calculates subtotal for multiple items', () => {
    const items = [
      { unit_price: 30.0, quantity: 1 },
      { unit_price: 15.5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(76.5);
  });

  it('adds delivery fee to subtotal', () => {
    const items = [{ unit_price: 40.0, quantity: 1 }];
    expect(calculateTotal(items, 10)).toBe(50.0);
  });

  it('handles zero delivery fee', () => {
    const items = [{ unit_price: 20.0, quantity: 2 }];
    expect(calculateTotal(items, 0)).toBe(40.0);
  });

  it('rounds to 2 decimal places', () => {
    const items = [{ unit_price: 10.33, quantity: 3 }];
    // 10.33 * 3 = 30.99
    expect(calculateTotal(items)).toBe(30.99);
  });

  it('handles empty items list', () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe('formatPrice', () => {
  it('formats a round number', () => {
    expect(formatPrice(10)).toBe('R$ 10,00');
  });

  it('returns empty string for null', () => {
    expect(formatPrice(null)).toBe('');
  });

  it('formats decimal price', () => {
    expect(formatPrice(29.9)).toBe('R$ 29,90');
  });
});
