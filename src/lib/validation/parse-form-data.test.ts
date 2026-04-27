import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { formDataToObject, parseFormData } from './parse-form-data';

describe('formDataToObject', () => {
  it('converte pares simples', () => {
    const fd = new FormData();
    fd.set('a', '1');
    fd.set('b', 'x');
    expect(formDataToObject(fd)).toEqual({ a: '1', b: 'x' });
  });

  it('agrupa chave repetida em array', () => {
    const fd = new FormData();
    fd.append('tag', 'a');
    fd.append('tag', 'b');
    expect(formDataToObject(fd)).toEqual({ tag: ['a', 'b'] });
  });

  it('suporta sufixo []', () => {
    const fd = new FormData();
    fd.append('tag[]', 'a');
    fd.append('tag[]', 'b');
    expect(formDataToObject(fd)).toEqual({ tag: ['a', 'b'] });
  });
});

describe('parseFormData', () => {
  const schema = z.object({
    email: z.string().email(),
    count: z.coerce.number().int(),
  });

  it('parse válido', () => {
    const fd = new FormData();
    fd.set('email', 'a@b.com');
    fd.set('count', '5');
    const result = parseFormData(schema, fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ email: 'a@b.com', count: 5 });
    }
  });

  it('parse inválido retorna erros', () => {
    const fd = new FormData();
    fd.set('email', 'not-email');
    fd.set('count', 'nope');
    const result = parseFormData(schema, fd);
    expect(result.success).toBe(false);
  });
});
