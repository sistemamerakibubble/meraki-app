import { describe, it, expect } from 'vitest';
import { patientSchema } from './patient';

describe('patientSchema', () => {
  it('aceita apenas nome preenchido', () => {
    const result = patientSchema.safeParse({ fullName: 'Maria Silva' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('Maria Silva');
      expect(result.data.birthdate).toBeNull();
      expect(result.data.phone).toBe('');
    }
  });

  it('rejeita nome vazio', () => {
    const r = patientSchema.safeParse({ fullName: '' });
    expect(r.success).toBe(false);
  });

  it('normaliza telefone', () => {
    const r = patientSchema.parse({ fullName: 'X', phone: '(11) 99999-9999' });
    expect(r.phone).toBe('11999999999');
  });

  it('rejeita telefone inválido', () => {
    const r = patientSchema.safeParse({ fullName: 'X', phone: 'abc' });
    expect(r.success).toBe(false);
  });

  it('aceita e-mail válido opcional', () => {
    const r = patientSchema.parse({ fullName: 'X', email: 'a@b.com' });
    expect(r.email).toBe('a@b.com');
  });

  it('rejeita e-mail mal formado', () => {
    const r = patientSchema.safeParse({ fullName: 'X', email: 'nope' });
    expect(r.success).toBe(false);
  });

  it('aceita nascimento em YYYY-MM-DD', () => {
    const r = patientSchema.parse({ fullName: 'X', birthdate: '1990-05-10' });
    expect(r.birthdate).toBe('1990-05-10');
  });

  it('converte birthdate vazio para null', () => {
    const r = patientSchema.parse({ fullName: 'X', birthdate: '' });
    expect(r.birthdate).toBeNull();
  });

  it('aceita CPF válido', () => {
    const r = patientSchema.parse({ fullName: 'X', document: '529.982.247-25' });
    expect(r.document).toBe('52998224725');
  });

  it('rejeita CPF inválido', () => {
    const r = patientSchema.safeParse({ fullName: 'X', document: '111.111.111-11' });
    expect(r.success).toBe(false);
  });
});
