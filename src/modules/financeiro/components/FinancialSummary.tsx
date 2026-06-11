import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatBRL } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import type { FinancialSummary as Summary } from '@/modules/financeiro/queries/getFinancialSummary';

export function FinancialSummary({ summary }: { summary: Summary }) {
  const profitPositive = summary.profitCents >= 0;
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Receita (pagos)</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">
              {formatBRL(summary.revenueCents)}
            </CardTitle>
          </div>
          <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          A receber: {formatBRL(summary.pendingRevenueCents)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Despesas (pagas)</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {formatBRL(summary.expensesCents)}
            </CardTitle>
          </div>
          <TrendingDown className="h-5 w-5 text-destructive" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Pagamentos confirmados
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Lucro líquido</CardDescription>
            <CardTitle
              className={cn('text-3xl', profitPositive ? 'text-emerald-600' : 'text-destructive')}
            >
              {formatBRL(summary.profitCents)}
            </CardTitle>
          </div>
          <Wallet className="h-5 w-5 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Receita menos despesa no período
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Atrasados</CardDescription>
            <CardTitle
              className={cn(
                'text-3xl',
                summary.overdueCount > 0 ? 'text-amber-600' : 'text-foreground',
              )}
            >
              {summary.overdueCount}
            </CardTitle>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Lançamentos pendentes com vencimento no passado
        </CardContent>
      </Card>
    </section>
  );
}
