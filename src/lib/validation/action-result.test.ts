import { describe, it, expect } from 'vitest';
import { err, ok } from './action-result';

describe('ok', () => {
  it('envolve data em Result de sucesso', () => {
    expect(ok({ id: 1 })).toEqual({ ok: true, data: { id: 1 } });
  });
});

describe('err', () => {
  it('envolve error em Result de falha', () => {
    expect(err('boom')).toEqual({ ok: false, error: 'boom' });
  });

  it('aceita objetos como erro', () => {
    const r = err({ formError: 'x' });
    expect(r).toEqual({ ok: false, error: { formError: 'x' } });
  });
});
