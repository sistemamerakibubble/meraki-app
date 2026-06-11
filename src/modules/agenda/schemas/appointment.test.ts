import { describe, it, expect } from 'vitest';
import { appointmentSchema } from './appointment';

const UUID = '00000000-0000-0000-0000-000000000001';

describe('appointmentSchema', () => {
  it('aceita payload mínimo válido', () => {
    const r = appointmentSchema.safeParse({
      patientId: UUID,
      professionalId: UUID,
      startsAt: '2026-05-10T10:00',
      endsAt: '2026-05-10T11:00',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.roomId).toBeNull();
      expect(r.data.notes).toBe('');
    }
  });

  it('rejeita UUID inválido em patientId', () => {
    const r = appointmentSchema.safeParse({
      patientId: 'not-uuid',
      professionalId: UUID,
      startsAt: '2026-05-10T10:00',
      endsAt: '2026-05-10T11:00',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita quando endsAt <= startsAt', () => {
    const r = appointmentSchema.safeParse({
      patientId: UUID,
      professionalId: UUID,
      startsAt: '2026-05-10T11:00',
      endsAt: '2026-05-10T10:00',
    });
    expect(r.success).toBe(false);
  });

  it('aceita roomId vazio como null', () => {
    const r = appointmentSchema.safeParse({
      patientId: UUID,
      professionalId: UUID,
      roomId: '',
      startsAt: '2026-05-10T10:00',
      endsAt: '2026-05-10T11:00',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.roomId).toBeNull();
  });

  it('aceita roomId UUID válido', () => {
    const r = appointmentSchema.parse({
      patientId: UUID,
      professionalId: UUID,
      roomId: UUID,
      startsAt: '2026-05-10T10:00',
      endsAt: '2026-05-10T11:00',
    });
    expect(r.roomId).toBe(UUID);
  });

  it('rejeita roomId não-UUID', () => {
    const r = appointmentSchema.safeParse({
      patientId: UUID,
      professionalId: UUID,
      roomId: 'invalid',
      startsAt: '2026-05-10T10:00',
      endsAt: '2026-05-10T11:00',
    });
    expect(r.success).toBe(false);
  });
});
