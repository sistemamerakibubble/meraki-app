'use server';

import { createClient } from '@/lib/supabase/server';
import { fromDbBilling } from '@/lib/supabase/helpers';
import type { Billing } from '@/types/domain';

export type UpcomingPayablesResult = {
  overdue: Billing[];
  thisWeek: Billing[];
  nextWeek: Billing[];
  later: Billing[];
  totalPendingCents: number;
  overdueCents: number;
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function listUpcomingPayables(): Promise<UpcomingPayablesResult> {
  const supabase = await createClient();

  const today = new Date();
  const in30days = addDays(today, 30);
  const endOfThisWeek = addDays(today, 7 - today.getDay());
  const endOfNextWeek = addDays(endOfThisWeek, 7);

  const { data, error } = await supabase
    .from('billings')
    .select('*, patients(full_name)', { count: 'exact' })
    .eq('type', 'despesa')
    .eq('status', 'pendente')
    .lte('due_date', toISO(in30days))
    .order('due_date', { ascending: true });

  if (error || !data) {
    return { overdue: [], thisWeek: [], nextWeek: [], later: [], totalPendingCents: 0, overdueCents: 0 };
  }

  const todayStr = toISO(today);
  const endOfThisWeekStr = toISO(endOfThisWeek);
  const endOfNextWeekStr = toISO(endOfNextWeek);

  const overdue: Billing[] = [];
  const thisWeek: Billing[] = [];
  const nextWeek: Billing[] = [];
  const later: Billing[] = [];

  for (const row of data) {
    const b = fromDbBilling(row);
    if (b.dueDate < todayStr) {
      overdue.push(b);
    } else if (b.dueDate <= endOfThisWeekStr) {
      thisWeek.push(b);
    } else if (b.dueDate <= endOfNextWeekStr) {
      nextWeek.push(b);
    } else {
      later.push(b);
    }
  }

  const all = [...overdue, ...thisWeek, ...nextWeek, ...later];
  const totalPendingCents = all.reduce((s, b) => s + b.amountCents, 0);
  const overdueCents = overdue.reduce((s, b) => s + b.amountCents, 0);

  return { overdue, thisWeek, nextWeek, later, totalPendingCents, overdueCents };
}
