import { describe, it, expect } from 'vitest';
import { billingSchema } from './billing';

const UUID = '00000000-0000-0000-0000-000000000001';

describe('billingSchema', () => {
  it('aceita payload mínimo válido', () => {
    const r = billingSchema.safeParse({
      type: 'receita',
      description: 'Consulta',
      amountCents: 15000,
      dueDate: '2026-05-10',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.amountCents).toBe(15000);
      expect(r.data.patientId).toBeNull();
    }
  });

  it('coerce string numérica em centavos', () => {
    const r = billingSchema.parse({
      type: 'despesa',
      description: 'Aluguel',
      amountCents: '120000',
      dueDate: '2026-05-10',
    });
    expect(r.amountCents).toBe(120000);
  });

  it('rejeita amountCents negativo ou zero', () => {
    expect(
      billingSchema.safeParse({
        type: 'receita',
        description: 'x',
        amountCents: 0,
        dueDate: '2026-05-10',
      }).success,
    ).toBe(false);
    expect(
      billingSchema.safeParse({
        type: 'receita',
        description: 'x',
        amountCents: -100,
        dueDate: '2026-05-10',
      }).success,
    ).toBe(false);
  });

  it('rejeita descrição vazia', () => {
    const r = billingSchema.safeParse({
      type: 'receita',
      description: '',
      amountCents: 100,
      dueDate: '2026-05-10',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita tipo inválido', () => {
    const r = billingSchema.safeParse({
      type: 'transferencia',
      description: 'x',
      amountCents: 100,
      dueDate: '2026-05-10',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita data fora de YYYY-MM-DD', () => {
    const r = billingSchema.safeParse({
      type: 'receita',
      description: 'x',
      amountCents: 100,
      dueDate: '10/05/2026',
    });
    expect(r.success).toBe(false);
  });

  it('aceita patientId UUID', () => {
    const r = billingSchema.parse({
      type: 'receita',
      description: 'x',
      amountCents: 100,
      dueDate: '2026-05-10',
      patientId: UUID,
    });
    expect(r.patientId).toBe(UUID);
  });

  it('rejeita patientId não-UUID', () => {
    const r = billingSchema.safeParse({
      type: 'receita',
      description: 'x',
      amountCents: 100,
      dueDate: '2026-05-10',
      patientId: 'nope',
    });
    expect(r.success).toBe(false);
  });
});
