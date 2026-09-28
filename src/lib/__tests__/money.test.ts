import { describe, expect, it } from 'vitest';
import { formatCents, formatCentsShort, formatPrice, SOB_CONSULTA } from '@/lib/money';

const plain = (s: string) => s.replace(/\u00a0/g, ' ');

describe('money', () => {
  it('formata centavos em reais', () => {
    expect(plain(formatCents(123456))).toBe('R$ 1.234,56');
    expect(plain(formatCents(5))).toBe('R$ 0,05');
  });
  it('omite ",00" em valores inteiros', () => {
    expect(plain(formatCents(18000000))).toBe('R$ 180.000');
    expect(plain(formatCents(18000000, { forceCents: true }))).toBe('R$ 180.000,00');
  });
  it('null é "Preço sob consulta", nunca zero', () => {
    expect(formatPrice(null)).toBe(SOB_CONSULTA);
    expect(plain(formatPrice(0))).toBe('R$ 0');
  });
  it('forma curta', () => {
    expect(formatCentsShort(18000000)).toBe('R$ 180 mil');
    expect(formatCentsShort(125000000)).toBe('R$ 1,3 mi');
  });
});
