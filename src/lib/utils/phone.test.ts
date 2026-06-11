import { describe, it, expect } from 'vitest';
import { formatPhone, isValidPhone, normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('extrai apenas dígitos', () => {
    expect(normalizePhone('(11) 99999-9999')).toBe('11999999999');
  });

  it('string vazia', () => {
    expect(normalizePhone('')).toBe('');
  });
});

describe('formatPhone', () => {
  it('formata celular 11 dígitos', () => {
    expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
  });

  it('formata fixo 10 dígitos', () => {
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
  });

  it('devolve original se tamanho inválido', () => {
    expect(formatPhone('123')).toBe('123');
  });
});

describe('isValidPhone', () => {
  it('valida 10 ou 11 dígitos', () => {
    expect(isValidPhone('11999999999')).toBe(true);
    expect(isValidPhone('(11) 3333-4444')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });
});
