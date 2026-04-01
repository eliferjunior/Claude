import { describe, it, expect } from 'vitest';

function formatPrice(value: number | null): string {
  if (value === null || value === undefined) return '';
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

describe('formatPrice', () => {
  it('formats integer price correctly', () => {
    expect(formatPrice(10)).toBe('R$ 10,00');
  });

  it('returns empty string for null', () => {
    expect(formatPrice(null)).toBe('');
  });

  it('formats decimal price correctly', () => {
    expect(formatPrice(29.9)).toBe('R$ 29,90');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('R$ 0,00');
  });

  it('formats price with two decimal places', () => {
    expect(formatPrice(15.55)).toBe('R$ 15,55');
  });

  it('returns empty string for undefined (cast as null)', () => {
    expect(formatPrice(undefined as unknown as null)).toBe('');
  });
});
