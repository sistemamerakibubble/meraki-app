import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, startOfWeekBR } from './dates';

describe('formatDate', () => {
  it('formata ISO date em pt-BR', () => {
    expect(formatDate('2026-04-16')).toBe('16/04/2026');
  });

  it('aceita Date', () => {
    const d = new Date(2026, 3, 16, 12, 0, 0);
    expect(formatDate(d)).toBe('16/04/2026');
  });
});

describe('formatDateTime', () => {
  it('formata ISO datetime', () => {
    const d = new Date(2026, 3, 16, 14, 30, 0);
    expect(formatDateTime(d)).toBe('16/04/2026 14:30');
  });
});

describe('startOfWeekBR', () => {
  it('retorna domingo da semana', () => {
    const quarta = new Date(2026, 3, 15);
    const domingo = startOfWeekBR(quarta);
    expect(domingo.getDay()).toBe(0);
    expect(domingo.getDate()).toBe(12);
  });
});
