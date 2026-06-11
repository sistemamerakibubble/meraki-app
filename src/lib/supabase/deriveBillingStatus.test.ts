import { describe, it, expect } from 'vitest';
import { deriveBillingStatus } from './helpers';

const NOW = new Date('2026-05-15T12:00:00.000Z');

describe('deriveBillingStatus', () => {
  it('pago permanece pago', () => {
    expect(deriveBillingStatus('pago', '2026-05-10', NOW)).toBe('pago');
  });

  it('cancelado permanece cancelado', () => {
    expect(deriveBillingStatus('cancelado', '2026-05-10', NOW)).toBe('cancelado');
  });

  it('pendente com vencimento futuro → pendente', () => {
    expect(deriveBillingStatus('pendente', '2026-06-01', NOW)).toBe('pendente');
  });

  it('pendente com vencimento hoje → pendente (até fim do dia)', () => {
    expect(deriveBillingStatus('pendente', '2026-05-15', NOW)).toBe('pendente');
  });

  it('pendente com vencimento passado → atrasado', () => {
    expect(deriveBillingStatus('pendente', '2026-05-10', NOW)).toBe('atrasado');
  });
});
