import type { Metadata } from 'next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/guards';
import { InventorySummary } from '@/modules/acervo/components/InventorySummary';
import { InventoryFilters } from '@/modules/acervo/components/InventoryFilters';
import { InventoryTable } from '@/modules/acervo/components/InventoryTable';
import { NewItemButton } from '@/modules/acervo/components/NewItemButton';
import { ExportButton } from '@/modules/acervo/components/ExportButton';
import { getInventorySummary } from '@/modules/acervo/queries/getInventorySummary';
import { listInventoryItems } from '@/modules/acervo/queries/listInventoryItems';
import { listInventoryCategories } from '@/modules/acervo/queries/listInventoryCategories';

export const metadata: Metadata = { title: 'Acervo Técnico' };

type SearchParams = Promise<{ q?: string; category?: string; lowStock?: string }>;

export default async function AcervoPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await requireUser();
  const canCreate = session.profile.role === 'admin' || session.profile.role === 'recepcao';

  const filter = {
    q: sp.q || undefined,
    category: sp.category || undefined,
    lowStock: sp.lowStock === '1',
  };

  const [summary, items, categories] = await Promise.all([
    getInventorySummary(),
    listInventoryItems(filter),
    listInventoryCategories(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Controle de Estoque</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie os suprimentos e equipamentos médicos
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton />
          {canCreate ? (
            <NewItemButton
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" aria-hidden />
                  Novo item
                </Button>
              }
            />
          ) : null}
        </div>
      </header>

      <InventorySummary summary={summary} />
      <InventoryFilters categories={categories} />
      <InventoryTable items={items} role={session.profile.role} />
    </div>
  );
}
