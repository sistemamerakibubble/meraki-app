import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

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

export function buildMonthRange(cursor: Date): { start: Date; end: Date; weeks: Date[][] } {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  // Start the grid from the Sunday of the week containing the 1st
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  // Build 6 weeks max
  const weeks: Date[][] = [];
  let current = gridStart;
  while (current <= monthEnd || weeks.length < 6) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
    if (current > monthEnd && weeks.length >= 4) break;
  }
  return { start: startOfDay(monthStart), end: endOfDay(monthEnd), weeks };
}

export function parseDateParam(raw: string | undefined, fallback: Date = new Date()): Date {
  if (!raw) return fallback;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? fallback : d;
}
