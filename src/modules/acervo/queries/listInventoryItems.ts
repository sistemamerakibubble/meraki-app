import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbInventoryItem } from '@/lib/supabase/helpers';
import type { InventoryItem } from '@/types/domain';

export type ListInventoryArgs = {
  q?: string;
  category?: string;
  lowStock?: boolean;
};

export async function listInventoryItems({
  q,
  category,
  lowStock,
}: ListInventoryArgs = {}): Promise<InventoryItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });

  if (category) query = query.eq('category', category);
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    query = query.or(`name.ilike.${like},description.ilike.${like},tag.ilike.${like}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []).map(fromDbInventoryItem);
  return lowStock ? items.filter((i) => i.lowStock) : items;
}
