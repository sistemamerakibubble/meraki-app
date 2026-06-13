'use server';

import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import type { ExpenseCategory } from '@/types/domain';

export async function listExpenseCategories(onlyActive = true): Promise<ExpenseCategory[]> {
  const session = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from('expense_categories')
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
    color: row.color,
    description: row.description,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
