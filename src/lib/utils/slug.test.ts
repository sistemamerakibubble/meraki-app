import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lower-case + trim', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('remove acentos', () => {
    expect(slugify('Configurações')).toBe('configuracoes');
    expect(slugify('João')).toBe('joao');
  });

  it('colapsa pontuação em hífens', () => {
    expect(slugify('foo/bar_baz.qux')).toBe('foo-bar-baz-qux');
  });

  it('remove hífens nas pontas', () => {
    expect(slugify('---foo---')).toBe('foo');
  });
});
