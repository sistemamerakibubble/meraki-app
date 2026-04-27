import { describe, it, expect } from 'vitest';
import { supervisionSchema, supervisionStatusSchema } from './supervision';

const UUID = '00000000-0000-0000-0000-000000000001';

describe('supervisionSchema', () => {
  it('aceita payload mínimo válido', () => {
    const r = supervisionSchema.safeParse({
      title: 'Caso X',
      supervisorId: UUID,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.patientId).toBeNull();
  });

  it('rejeita título vazio', () => {
    const r = supervisionSchema.safeParse({ title: '', supervisorId: UUID });
    expect(r.success).toBe(false);
  });

  it('rejeita supervisorId não-UUID', () => {
    const r = supervisionSchema.safeParse({ title: 'x', supervisorId: 'nope' });
    expect(r.success).toBe(false);
  });

  it('aceita patientId UUID', () => {
    const r = supervisionSchema.parse({
      title: 'x',
      supervisorId: UUID,
      patientId: UUID,
    });
    expect(r.patientId).toBe(UUID);
  });
});

describe('supervisionStatusSchema', () => {
  it('aceita statuses válidos', () => {
    for (const s of ['pendente', 'em_revisao', 'concluida', 'cancelada']) {
      expect(supervisionStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('rejeita status inválido', () => {
    expect(supervisionStatusSchema.safeParse('realizada').success).toBe(false);
  });
});
