import { AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { InventoryRowActions } from '@/modules/acervo/components/InventoryRowActions';
import type { InventoryItem, Role } from '@/types/domain';

export function InventoryTable({
  items,
  role,
}: {
  items: InventoryItem[];
  role: Role;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Nenhum item encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste os filtros ou cadastre um novo item.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3 text-right">Quantidade</th>
            <th className="px-4 py-3">Unidade</th>
            <th className="px-4 py-3 text-right">Mínimo</th>
            <th className="px-4 py-3">Etiqueta</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id} className={cn(item.lowStock && 'bg-amber-500/5')}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 font-medium">
                  {item.lowStock ? (
                    <AlertTriangle
                      className="h-4 w-4 text-amber-600"
                      aria-label="Estoque baixo"
                    />
                  ) : null}
                  {item.name}
                </div>
                {item.description ? (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{item.category ?? '—'}</td>
              <td
                className={cn(
                  'px-4 py-3 text-right font-semibold tabular-nums',
                  item.lowStock && 'text-amber-700',
                )}
              >
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {item.minQuantity}
              </td>
              <td className="px-4 py-3">
                {item.tag ? (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {item.tag}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3">
                <InventoryRowActions item={item} role={role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
