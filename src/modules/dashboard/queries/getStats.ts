import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type DashboardStats = {
  appointmentsToday: { total: number; confirmed: number };
  revenueTodayCents: number;
  pendingSupervisions: number;
  billsDueTodayCents: number;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const todayISO = new Date().toISOString().slice(0, 10);
  const dayStart = startOfToday().toISOString();
  const dayEnd = endOfToday().toISOString();

  const [appts, revenue, supervisions, bills] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, status, confirmed')
      .gte('starts_at', dayStart)
      .lte('starts_at', dayEnd)
      .neq('status', 'cancelado'),
    supabase
      .from('billings')
      .select('amount_cents')
      .eq('type', 'receita')
      .eq('status', 'pago')
      .gte('paid_at', dayStart)
      .lte('paid_at', dayEnd),
    supabase
      .from('supervisions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pendente', 'em_revisao']),
    supabase
      .from('billings')
      .select('amount_cents')
      .eq('status', 'pendente')
      .eq('due_date', todayISO),
  ]);

  const apptRows = appts.data ?? [];
  const confirmed = apptRows.filter((a) => a.confirmed || a.status === 'confirmado').length;

  const revenueTodayCents = (revenue.data ?? []).reduce(
    (acc, r) => acc + r.amount_cents,
    0,
  );
  const billsDueTodayCents = (bills.data ?? []).reduce(
    (acc, r) => acc + r.amount_cents,
    0,
  );

  return {
    appointmentsToday: { total: apptRows.length, confirmed },
    revenueTodayCents,
    pendingSupervisions: supervisions.count ?? 0,
    billsDueTodayCents,
  };
}
