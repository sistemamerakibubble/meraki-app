'use client';

import type { ReactNode } from 'react';
import { InventoryItemForm } from '@/modules/acervo/components/InventoryItemForm';

export function NewItemButton({ trigger }: { trigger: ReactNode }) {
  return <InventoryItemForm mode={{ kind: 'create' }} trigger={trigger} />;
}
