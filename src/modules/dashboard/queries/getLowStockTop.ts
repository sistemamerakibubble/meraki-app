import 'server-only';

import { listInventoryItems } from '@/modules/acervo/queries/listInventoryItems';
import type { InventoryItem } from '@/types/domain';

export async function getLowStockTop(limit = 5): Promise<InventoryItem[]> {
  const items = await listInventoryItems({ lowStock: true });
  return items.slice(0, limit);
}
