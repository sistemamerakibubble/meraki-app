import { describe, it, expect } from 'vitest';
import { updatePasswordSchema } from './update-password';

describe('updatePasswordSchema', () => {
  it('aceita senhas iguais com tamanho mínimo', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita senhas diferentes', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'different1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmErr = result.error.flatten().fieldErrors.confirmPassword;
      expect(confirmErr?.[0]).toMatch(/não coincidem/);
    }
  });

  it('rejeita senha curta', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });
});
