import { describe, it, expect } from 'vitest';
import { messageSchema } from './message';

const UUID = '00000000-0000-0000-0000-000000000001';

describe('messageSchema', () => {
  it('aceita mensagem válida', () => {
    const r = messageSchema.safeParse({ supervisionId: UUID, content: 'Olá' });
    expect(r.success).toBe(true);
  });

  it('rejeita conteúdo vazio', () => {
    expect(messageSchema.safeParse({ supervisionId: UUID, content: '' }).success).toBe(false);
  });

  it('rejeita supervisionId não-UUID', () => {
    expect(messageSchema.safeParse({ supervisionId: 'x', content: 'a' }).success).toBe(false);
  });

  it('rejeita conteúdo muito longo', () => {
    expect(
      messageSchema.safeParse({ supervisionId: UUID, content: 'x'.repeat(5_001) }).success,
    ).toBe(false);
  });
});
