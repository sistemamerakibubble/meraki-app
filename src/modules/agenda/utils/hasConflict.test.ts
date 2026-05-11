import { describe, it, expect } from 'vitest';
import { hasConflict } from './hasConflict';
import type { Appointment } from '@/types/domain';

const PROF_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PROF_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

function base(overrides: Partial<Appointment>): Appointment {
  return {
    id: 'x',
    orgId: 'o',
    patientId: 'p',
    patientName: null,
    professionalId: PROF_A,
    professionalName: null,
    roomId: null,
    roomName: null,
    startsAt: '2026-05-10T10:00:00.000Z',
    endsAt: '2026-05-10T11:00:00.000Z',
    status: 'agendado',
    confirmed: false,
    notes: null,
    recurrenceGroupId: null,
    ...overrides,
  };
}

describe('hasConflict', () => {
  it('retorna false sem existing appointments', () => {
    expect(
      hasConflict([], {
        professionalId: PROF_A,
        startsAt: '2026-05-10T10:00:00.000Z',
        endsAt: '2026-05-10T11:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('detecta sobreposição exata', () => {
    const existing = [base({})];
    expect(
      hasConflict(existing, {
        professionalId: PROF_A,
        startsAt: '2026-05-10T10:00:00.000Z',
        endsAt: '2026-05-10T11:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('detecta sobreposição parcial', () => {
    const existing = [base({})];
    expect(
      hasConflict(existing, {
        professionalId: PROF_A,
        startsAt: '2026-05-10T10:30:00.000Z',
        endsAt: '2026-05-10T11:30:00.000Z',
      }),
    ).toBe(true);
  });

  it('não conflita com outro profissional', () => {
    const existing = [base({})];
    expect(
      hasConflict(existing, {
        professionalId: PROF_B,
        startsAt: '2026-05-10T10:00:00.000Z',
        endsAt: '2026-05-10T11:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('ignora agendamento cancelado', () => {
    const existing = [base({ status: 'cancelado' })];
    expect(
      hasConflict(existing, {
        professionalId: PROF_A,
        startsAt: '2026-05-10T10:00:00.000Z',
        endsAt: '2026-05-10T11:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('não conflita quando adjacente (fim == início)', () => {
    const existing = [base({})];
    expect(
      hasConflict(existing, {
        professionalId: PROF_A,
        startsAt: '2026-05-10T11:00:00.000Z',
        endsAt: '2026-05-10T12:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('ignora o próprio id quando excludeId é passado', () => {
    const existing = [base({ id: 'self' })];
    expect(
      hasConflict(existing, {
        professionalId: PROF_A,
        startsAt: '2026-05-10T10:00:00.000Z',
        endsAt: '2026-05-10T11:00:00.000Z',
        excludeId: 'self',
      }),
    ).toBe(false);
  });
});
