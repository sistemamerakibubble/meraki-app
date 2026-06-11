import { describe, it, expect } from 'vitest';
import { patientNoteSchema } from './patient-note';

const UUID = '00000000-0000-0000-0000-0000000000aa';

describe('patientNoteSchema', () => {
  it('aceita payload válido', () => {
    expect(
      patientNoteSchema.safeParse({ patientId: UUID, content: 'Paciente ligou.' }).success,
    ).toBe(true);
  });

  it('rejeita conteúdo vazio', () => {
    expect(patientNoteSchema.safeParse({ patientId: UUID, content: '' }).success).toBe(false);
  });

  it('rejeita conteúdo acima de 2000 chars', () => {
    expect(
      patientNoteSchema.safeParse({ patientId: UUID, content: 'x'.repeat(2001) }).success,
    ).toBe(false);
  });

  it('rejeita patientId inválido', () => {
    expect(patientNoteSchema.safeParse({ patientId: 'nope', content: 'x' }).success).toBe(false);
  });
});
