import { describe, it, expect } from 'vitest';
import { buildPaginationRange } from './paginate';

describe('buildPaginationRange', () => {
  it('página única', () => {
    expect(buildPaginationRange(1, 1)).toEqual([1]);
  });

  it('sem gap para poucas páginas', () => {
    expect(buildPaginationRange(1, 3)).toEqual([1, 2, 3]);
  });

  it('insere reticências no meio', () => {
    expect(buildPaginationRange(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });

  it('sem reticência quando adjacente', () => {
    expect(buildPaginationRange(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('cursor no fim', () => {
    expect(buildPaginationRange(10, 10)).toEqual([1, '...', 9, 10]);
  });
});
