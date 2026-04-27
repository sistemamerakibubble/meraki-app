export type PaginationItem = number | '...';

export function buildPaginationRange(current: number, total: number): PaginationItem[] {
  if (total <= 1) return [1];

  const delta = 1;
  const range: PaginationItem[] = [];
  const rangeWithDots: PaginationItem[] = [];
  let last: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const page of range) {
    if (last !== undefined && typeof page === 'number' && page - last > 1) {
      rangeWithDots.push('...');
    }
    rangeWithDots.push(page);
    if (typeof page === 'number') last = page;
  }

  return rangeWithDots;
}
