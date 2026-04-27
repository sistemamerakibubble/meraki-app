import { describe, it, expect } from 'vitest';
import { evolutionSchema } from './evolution';

const UUID = '00000000-0000-0000-0000-0000000000aa';

describe('evolutionSchema', () => {
  it('aceita payload válido', () => {
    const r = evolutionSchema.safeParse({
      patientId: UUID,
      title: '5ª evolução',
      summary: 'Boa adesão.',
      content: 'Detalhes da evolução...',
    });
    expect(r.success).toBe(true);
  });

  it('rejeita patientId não-UUID', () => {
    const r = evolutionSchema.safeParse({
      patientId: 'no',
      title: 't',
      summary: 's',
      content: 'c',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita campos vazios', () => {
    expect(
      evolutionSchema.safeParse({ patientId: UUID, title: '', summary: 's', content: 'c' })
        .success,
    ).toBe(false);
    expect(
      evolutionSchema.safeParse({ patientId: UUID, title: 't', summary: '', content: 'c' })
        .success,
    ).toBe(false);
    expect(
      evolutionSchema.safeParse({ patientId: UUID, title: 't', summary: 's', content: '' })
        .success,
    ).toBe(false);
  });

  it('rejeita summary acima de 500 chars', () => {
    expect(
      evolutionSchema.safeParse({
        patientId: UUID,
        title: 't',
        summary: 'x'.repeat(501),
        content: 'c',
      }).success,
    ).toBe(false);
  });
});
