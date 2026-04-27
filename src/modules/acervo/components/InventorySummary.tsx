import { Package, AlertTriangle, Tag } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import type { InventorySummary as Summary } from '@/modules/acervo/queries/getInventorySummary';

export function InventorySummary({ summary }: { summary: Summary }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Total de itens</CardDescription>
            <CardTitle className="text-4xl">{summary.totalItems}</CardTitle>
          </div>
          <Package className="h-6 w-6 text-primary" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Itens cadastrados no acervo
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Estoque baixo</CardDescription>
            <CardTitle
              className={cn(
                'text-4xl',
                summary.lowStockCount > 0 ? 'text-amber-600' : 'text-foreground',
              )}
            >
              {summary.lowStockCount}
            </CardTitle>
          </div>
          <AlertTriangle
            className={cn(
              'h-6 w-6',
              summary.lowStockCount > 0 ? 'text-amber-600' : 'text-muted-foreground',
            )}
            aria-hidden
          />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Itens no ou abaixo do mínimo configurado
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Categorias</CardDescription>
            <CardTitle className="text-4xl">{summary.categoriesCount}</CardTitle>
          </div>
          <Tag className="h-6 w-6 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Categorias distintas em uso
        </CardContent>
      </Card>
    </section>
  );
}
