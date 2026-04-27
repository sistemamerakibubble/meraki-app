import { describe, it, expect } from 'vitest';
import { reminderSchema } from './reminder';

describe('reminderSchema', () => {
  it('aceita content válido', () => {
    expect(reminderSchema.safeParse({ content: 'Ligar para cliente' }).success).toBe(true);
  });

  it('rejeita vazio', () => {
    expect(reminderSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('rejeita acima de 500 chars', () => {
    expect(reminderSchema.safeParse({ content: 'x'.repeat(501) }).success).toBe(false);
  });
});
