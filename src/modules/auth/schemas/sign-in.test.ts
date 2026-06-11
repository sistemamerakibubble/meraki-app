import { describe, it, expect } from 'vitest';
import { signInSchema } from './sign-in';

describe('signInSchema', () => {
  it('aceita entrada válida', () => {
    const result = signInSchema.safeParse({
      email: 'user@meraki.dev',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@meraki.dev');
      expect(result.data.rememberMe).toBe(false);
    }
  });

  it('rejeita e-mail inválido', () => {
    const result = signInSchema.safeParse({ email: 'bad', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejeita senha curta', () => {
    const result = signInSchema.safeParse({ email: 'a@b.com', password: 'abc' });
    expect(result.success).toBe(false);
  });

  it('normaliza rememberMe "on" para true', () => {
    const result = signInSchema.parse({
      email: 'a@b.com',
      password: 'password123',
      rememberMe: 'on',
    });
    expect(result.rememberMe).toBe(true);
  });

  it('rememberMe ausente vira false', () => {
    const result = signInSchema.parse({
      email: 'a@b.com',
      password: 'password123',
    });
    expect(result.rememberMe).toBe(false);
  });
});
