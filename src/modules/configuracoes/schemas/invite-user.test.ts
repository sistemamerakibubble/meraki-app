import { describe, it, expect } from 'vitest';
import { inviteUserSchema } from './invite-user';

describe('inviteUserSchema', () => {
  it('aceita payload válido', () => {
    const r = inviteUserSchema.safeParse({
      email: 'novo@meraki.dev',
      fullName: 'Novo Usuário',
      role: 'medico',
    });
    expect(r.success).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    const r = inviteUserSchema.safeParse({
      email: 'nope',
      fullName: 'X',
      role: 'medico',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita nome vazio', () => {
    const r = inviteUserSchema.safeParse({
      email: 'a@b.com',
      fullName: '',
      role: 'medico',
    });
    expect(r.success).toBe(false);
  });

  it('rejeita role inválido', () => {
    const r = inviteUserSchema.safeParse({
      email: 'a@b.com',
      fullName: 'X',
      role: 'root',
    });
    expect(r.success).toBe(false);
  });

  it('aceita todos os roles válidos', () => {
    for (const role of ['admin', 'medico', 'supervisor', 'recepcao']) {
      const r = inviteUserSchema.safeParse({
        email: 'a@b.com',
        fullName: 'X',
        role,
      });
      expect(r.success).toBe(true);
    }
  });
});
