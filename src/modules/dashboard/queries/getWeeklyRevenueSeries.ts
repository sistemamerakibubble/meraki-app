import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type WeeklyRevenuePoint = {
  day: string;
  label: string;
  revenueCents: number;
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export async function getWeeklyRevenueSeries(): Promise<WeeklyRevenuePoint[]> {
  const supabase = await createClient();

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const { data, error } = await supabase
    .from('billings')
    .select('amount_cents, paid_at')
    .eq('type', 'receita')
    .eq('status', 'pago')
    .gte('paid_at', start.toISOString())
    .lt('paid_at', end.toISOString());

  if (error) throw error;

  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      day: d.toISOString().slice(0, 10),
      label: DAY_LABELS[i]!,
      revenueCents: 0,
    };
  });

  for (const row of data ?? []) {
    if (!row.paid_at) continue;
    const idx = Math.floor(
      (new Date(row.paid_at).getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (idx >= 0 && idx < 7) {
      buckets[idx]!.revenueCents += row.amount_cents;
    }
  }

  return buckets;
}
