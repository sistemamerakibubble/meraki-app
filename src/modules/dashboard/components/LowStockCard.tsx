import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { routes } from '@/lib/constants/routes';
import type { InventoryItem } from '@/types/domain';

export function LowStockCard({ items }: { items: InventoryItem[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Estoque baixo</CardTitle>
        <AlertTriangle
          className={items.length > 0 ? 'h-4 w-4 text-amber-600' : 'h-4 w-4 text-muted-foreground'}
          aria-hidden
        />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Tudo em dia.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{i.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {i.quantity}/{i.minQuantity} {i.unit}
                </span>
              </li>
            ))}
            <li>
              <Link
                href={routes.acervo}
                className="text-xs text-primary hover:underline"
              >
                Ver estoque completo →
              </Link>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
