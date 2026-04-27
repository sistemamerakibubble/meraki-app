import { describe, it, expect } from 'vitest';
import { updateUserSchema } from './update-user';

describe('updateUserSchema', () => {
  it('aceita payload válido', () => {
    const r = updateUserSchema.safeParse({ fullName: 'Fulano', role: 'admin' });
    expect(r.success).toBe(true);
  });

  it('rejeita nome vazio', () => {
    const r = updateUserSchema.safeParse({ fullName: '', role: 'admin' });
    expect(r.success).toBe(false);
  });

  it('rejeita role inválido', () => {
    const r = updateUserSchema.safeParse({ fullName: 'X', role: 'root' });
    expect(r.success).toBe(false);
  });
});
