import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type InventorySummary = {
  totalItems: number;
  lowStockCount: number;
  categoriesCount: number;
};

export async function getInventorySummary(): Promise<InventorySummary> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_items')
    .select('quantity, min_quantity, category');

  if (error) throw error;
  const rows = data ?? [];

  const totalItems = rows.length;
  const lowStockCount = rows.filter(
    (r) => r.min_quantity > 0 && r.quantity <= r.min_quantity,
  ).length;
  const categoriesCount = new Set(
    rows.map((r) => r.category?.trim()).filter((c): c is string => !!c),
  ).size;

  return { totalItems, lowStockCount, categoriesCount };
}
