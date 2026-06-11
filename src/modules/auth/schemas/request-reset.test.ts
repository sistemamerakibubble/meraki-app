import { describe, it, expect } from 'vitest';
import { requestResetSchema } from './request-reset';

describe('requestResetSchema', () => {
  it('aceita e-mail válido', () => {
    expect(requestResetSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    expect(requestResetSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });

  it('rejeita vazio', () => {
    expect(requestResetSchema.safeParse({ email: '' }).success).toBe(false);
  });
});
