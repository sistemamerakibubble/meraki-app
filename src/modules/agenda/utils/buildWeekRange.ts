import { addDays, endOfDay, startOfDay, startOfWeek } from 'date-fns';

export type WeekRange = {
  start: Date;
  end: Date;
  days: Date[];
};

export function buildWeekRange(cursor: Date): WeekRange {
  const start = startOfWeek(cursor, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return {
    start: startOfDay(start),
    end: endOfDay(addDays(start, 6)),
    days,
  };
}

export function buildDayRange(cursor: Date): { start: Date; end: Date } {
  return { start: startOfDay(cursor), end: endOfDay(cursor) };
}

export function parseDateParam(raw: string | undefined, fallback: Date = new Date()): Date {
  if (!raw) return fallback;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? fallback : d;
}
