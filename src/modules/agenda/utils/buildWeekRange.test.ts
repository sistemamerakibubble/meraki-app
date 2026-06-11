import { describe, it, expect } from 'vitest';
import { buildWeekRange, buildDayRange, parseDateParam } from './buildWeekRange';

describe('buildWeekRange', () => {
  it('gera 7 dias começando no domingo', () => {
    const quarta = new Date(2026, 4, 13); // 13/05/2026 é quarta
    const range = buildWeekRange(quarta);
    expect(range.days).toHaveLength(7);
    expect(range.days[0]?.getDay()).toBe(0);
    expect(range.days[6]?.getDay()).toBe(6);
  });

  it('respeita virada de mês', () => {
    const quintaFimMes = new Date(2026, 3, 30);
    const range = buildWeekRange(quintaFimMes);
    const first = range.days[0];
    const last = range.days[6];
    expect(first?.getMonth()).toBe(3);
    expect(last?.getMonth()).toBe(4);
  });
});

describe('buildDayRange', () => {
  it('retorna intervalo do dia inteiro', () => {
    const d = new Date(2026, 4, 10, 14, 30);
    const range = buildDayRange(d);
    expect(range.start.getHours()).toBe(0);
    expect(range.end.getHours()).toBe(23);
  });
});

describe('parseDateParam', () => {
  it('parseia ISO válido', () => {
    const d = parseDateParam('2026-05-10');
    expect(d.getFullYear()).toBe(2026);
  });

  it('fallback para hoje em input undefined', () => {
    const d = parseDateParam(undefined);
    expect(Number.isFinite(d.getTime())).toBe(true);
  });

  it('fallback em string inválida', () => {
    const fallback = new Date(2026, 0, 1);
    const d = parseDateParam('not-a-date', fallback);
    expect(d.getTime()).toBe(fallback.getTime());
  });
});
