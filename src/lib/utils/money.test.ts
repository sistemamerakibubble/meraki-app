import { describe, it, expect } from 'vitest';
import { brlToCents, centsToBRL, formatBRL } from './money';

function stripNbsp(s: string): string {
  return s.replace(/\u00a0/g, ' ');
}

describe('formatBRL', () => {
  it('formata zero', () => {
    expect(stripNbsp(formatBRL(0))).toBe('R$ 0,00');
  });

  it('formata centenas', () => {
    expect(stripNbsp(formatBRL(10000))).toBe('R$ 100,00');
  });

  it('formata milhares com separador', () => {
    expect(stripNbsp(formatBRL(123456))).toBe('R$ 1.234,56');
  });

  it('centsToBRL é alias de formatBRL', () => {
    expect(centsToBRL(9999)).toBe(formatBRL(9999));
  });
});

describe('brlToCents', () => {
  it('converte string com prefixo R$', () => {
    expect(brlToCents('R$ 100,00')).toBe(10000);
  });

  it('converte com milhares', () => {
    expect(brlToCents('R$ 1.234,56')).toBe(123456);
  });

  it('aceita sem prefixo', () => {
    expect(brlToCents('100,00')).toBe(10000);
  });

  it('aceita zero', () => {
    expect(brlToCents('R$ 0,00')).toBe(0);
  });

  it('falha em string inválida', () => {
    expect(() => brlToCents('abc')).toThrow();
  });
});
