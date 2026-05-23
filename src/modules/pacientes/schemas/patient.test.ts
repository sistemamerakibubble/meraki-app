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

  it('aceita campos de anamnese opcionais', () => {
    const r = patientSchema.parse({
      fullName: 'X',
      rg: '12.345.678-9',
      nationality: 'Brasileira',
      birthplace: 'São Paulo - SP',
      address: 'Rua A, 123, 01000-000',
      livesWith: 'Pais',
      mainComplaints: 'Dificuldade de atenção',
      hadNeuropsychEvaluation: 'sim',
      diagnosis: 'TDAH',
      bestSessionPeriod: 'Tarde',
      careType: 'Online',
    });
    expect(r.rg).toBe('12.345.678-9');
    expect(r.hadNeuropsychEvaluation).toBe('sim');
    expect(r.bestSessionPeriod).toBe('Tarde');
    expect(r.careType).toBe('Online');
  });

  it('rejeita período/tipo fora das opções', () => {
    expect(
      patientSchema.safeParse({ fullName: 'X', bestSessionPeriod: 'Madrugada' }).success,
    ).toBe(false);
    expect(patientSchema.safeParse({ fullName: 'X', careType: 'Telepatia' }).success).toBe(
      false,
    );
  });

  it('anamnese vazia mantém defaults', () => {
    const r = patientSchema.parse({ fullName: 'X' });
    expect(r.hadNeuropsychEvaluation).toBe('');
    expect(r.bestSessionPeriod).toBe('');
    expect(r.careType).toBe('');
    expect(r.rg).toBe('');
  });
});
