import { describe, it, expect } from 'vitest';
import {
  isValidCPF,
  zBrazilianPhone,
  zCPF,
  zDate,
  zEmail,
  zOptionalBrazilianPhone,
  zOptionalCPF,
} from './zod-common';

describe('zEmail', () => {
  it('aceita e-mail válido', () => {
    expect(zEmail.parse('a@b.com')).toBe('a@b.com');
  });

  it('rejeita vazio', () => {
    expect(zEmail.safeParse('').success).toBe(false);
  });

  it('rejeita formato inválido', () => {
    expect(zEmail.safeParse('not-an-email').success).toBe(false);
  });
});

describe('zBrazilianPhone', () => {
  it('aceita celular com formatação', () => {
    expect(zBrazilianPhone.parse('(11) 99999-9999')).toBe('11999999999');
  });

  it('aceita fixo 10 dígitos', () => {
    expect(zBrazilianPhone.parse('1133334444')).toBe('1133334444');
  });

  it('rejeita menos de 10 dígitos', () => {
    expect(zBrazilianPhone.safeParse('12345').success).toBe(false);
  });
});

describe('zOptionalBrazilianPhone', () => {
  it('aceita vazio', () => {
    expect(zOptionalBrazilianPhone.parse('')).toBe('');
    expect(zOptionalBrazilianPhone.parse(undefined)).toBe('');
  });

  it('aceita telefone válido', () => {
    expect(zOptionalBrazilianPhone.parse('11999999999')).toBe('11999999999');
  });

  it('rejeita telefone inválido', () => {
    expect(zOptionalBrazilianPhone.safeParse('abc').success).toBe(false);
  });
});

describe('isValidCPF', () => {
  it('aceita CPF válido', () => {
    expect(isValidCPF('52998224725')).toBe(true);
  });

  it('rejeita CPF com todos iguais', () => {
    expect(isValidCPF('11111111111')).toBe(false);
  });

  it('rejeita CPF com tamanho errado', () => {
    expect(isValidCPF('123')).toBe(false);
  });

  it('rejeita CPF com dígitos errados', () => {
    expect(isValidCPF('52998224720')).toBe(false);
  });
});

describe('zCPF', () => {
  it('aceita e normaliza formatação', () => {
    expect(zCPF.parse('529.982.247-25')).toBe('52998224725');
  });

  it('rejeita CPF inválido', () => {
    expect(zCPF.safeParse('111.111.111-11').success).toBe(false);
  });
});

describe('zOptionalCPF', () => {
  it('aceita vazio', () => {
    expect(zOptionalCPF.parse('')).toBe('');
  });

  it('aceita CPF válido', () => {
    expect(zOptionalCPF.parse('52998224725')).toBe('52998224725');
  });

  it('rejeita CPF inválido', () => {
    expect(zOptionalCPF.safeParse('11111111111').success).toBe(false);
  });
});

describe('zDate', () => {
  it('aceita YYYY-MM-DD', () => {
    expect(zDate.parse('2026-04-16')).toBe('2026-04-16');
  });

  it('rejeita outros formatos', () => {
    expect(zDate.safeParse('16/04/2026').success).toBe(false);
    expect(zDate.safeParse('2026-4-16').success).toBe(false);
  });
});
