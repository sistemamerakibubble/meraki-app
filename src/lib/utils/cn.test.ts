import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('une classes simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignora valores falsy', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('aplica condicionais via objeto do clsx', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('resolve conflitos de utilitários do tailwind-merge', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('text-sm text-lg')).toBe('text-lg');
  });
});
