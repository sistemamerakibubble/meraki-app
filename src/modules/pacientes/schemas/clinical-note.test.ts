import { describe, it, expect } from 'vitest';
import { clinicalNoteSchema } from './clinical-note';

const PATIENT_ID = '00000000-0000-0000-0000-0000000000aa';

describe('clinicalNoteSchema', () => {
  it('aceita content válido', () => {
    const r = clinicalNoteSchema.safeParse({ patientId: PATIENT_ID, content: 'Observação.' });
    expect(r.success).toBe(true);
  });

  it('rejeita conteúdo vazio', () => {
    const r = clinicalNoteSchema.safeParse({ patientId: PATIENT_ID, content: '' });
    expect(r.success).toBe(false);
  });

  it('rejeita patientId não-UUID', () => {
    const r = clinicalNoteSchema.safeParse({ patientId: 'not-a-uuid', content: 'x' });
    expect(r.success).toBe(false);
  });

  it('rejeita conteúdo muito longo', () => {
    const r = clinicalNoteSchema.safeParse({
      patientId: PATIENT_ID,
      content: 'x'.repeat(10_001),
    });
    expect(r.success).toBe(false);
  });
});
