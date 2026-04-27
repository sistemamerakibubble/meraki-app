import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type FinancialSummary = {
  revenueCents: number;
  expensesCents: number;
  profitCents: number;
  pendingRevenueCents: number;
  overdueCount: number;
};

export type SummaryRange = {
  from?: string;
  to?: string;
};

export async function getFinancialSummary({ from, to }: SummaryRange = {}): Promise<FinancialSummary> {
  const supabase = await createClient();

  let query = supabase
    .from('billings')
    .select('type, status, amount_cents, due_date, paid_at');

  if (from) query = query.gte('due_date', from);
  if (to) query = query.lte('due_date', to);

  const { data, error } = await query;
  if (error) throw error;

  const todayISO = new Date().toISOString().slice(0, 10);

  let revenue = 0;
  let expenses = 0;
  let pending = 0;
  let overdue = 0;

  for (const row of data ?? []) {
    if (row.status === 'pago') {
      if (row.type === 'receita') revenue += row.amount_cents;
      if (row.type === 'despesa') expenses += row.amount_cents;
    } else if (row.status === 'pendente') {
      if (row.type === 'receita') pending += row.amount_cents;
      if (row.due_date < todayISO) overdue += 1;
    }
  }

  return {
    revenueCents: revenue,
    expensesCents: expenses,
    profitCents: revenue - expenses,
    pendingRevenueCents: pending,
    overdueCount: overdue,
  };
}
