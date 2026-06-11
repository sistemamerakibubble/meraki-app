import 'server-only';

import { createClient } from '@/lib/supabase/server';

export async function listInventoryCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('category');

  if (error) throw error;

  const set = new Set<string>();
  for (const row of data ?? []) {
    const c = row.category?.trim();
    if (c) set.add(c);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
