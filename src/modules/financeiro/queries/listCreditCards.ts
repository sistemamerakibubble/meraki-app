'use server';

import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import type { CreditCard } from '@/types/domain';

export async function listCreditCards(onlyActive = true): Promise<CreditCard[]> {
  const session = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from('credit_cards')
    .select('*')
    .eq('org_id', session.profile.orgId)
    .order('name');

  if (onlyActive) query = query.eq('active', true);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    brand: row.brand,
    lastFour: row.last_four,
    closingDay: row.closing_day,
    dueDay: row.due_day,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
