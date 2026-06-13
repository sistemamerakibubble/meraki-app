import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BillingStatusBadge } from '@/modules/financeiro/components/BillingStatusBadge';
import { NfStatusBadge } from '@/modules/financeiro/components/NfStatusBadge';
import { BillingRowActions } from '@/modules/financeiro/components/BillingRowActions';
import { formatBRL } from '@/lib/utils/money';
import { formatDate } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/constants/routes';
import type { CreditCard, ExpenseCategory, PaymentAccount, Role } from '@/types/domain';
import type { ListBillingsResult } from '@/modules/financeiro/queries/listBillings';

export function BillingsTable({
  result,
  patients,
  accounts = [],
  cards = [],
  categories = [],
  role,
  query,
}: {
  result: ListBillingsResult;
  patients: { id: string; fullName: string }[];
  accounts?: PaymentAccount[];
  cards?: CreditCard[];
  categories?: ExpenseCategory[];
  role: Role;
  query: Record<string, string | undefined>;
}) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (result.items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Nenhum lançamento encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste os filtros ou crie um novo lançamento.
        </p>
      </div>
    );
  }

  const hasPrev = result.page > 1;
  const hasNext = result.hasMore;
  const baseParams = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v) baseParams.set(k, v);
  const toPage = (p: number) => {
    const params = new URLSearchParams(baseParams);
    if (p > 1) params.set('page', String(p));
    else params.delete('page');
    return `${routes.financeiro}${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Descrição / Categoria</th>
              <th className="px-4 py-3 hidden sm:table-cell">Paciente</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden md:table-cell">NF</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {result.items.map((b) => {
              const cat = b.expenseCategoryId ? categoryMap.get(b.expenseCategoryId) : null;
              return (
                <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {b.type === 'receita' ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" aria-hidden />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{b.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {cat ? (
                            <span
                              className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </span>
                          ) : null}
                          {b.installmentCount ? (
                            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                              {b.installmentNumber}/{b.installmentCount}
                            </span>
                          ) : null}
                          {b.recurrenceType === 'recorrente' ? (
                            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                              Recorrente
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {b.patientName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(b.dueDate)}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap',
                      b.type === 'receita' ? 'text-emerald-600' : 'text-destructive',
                    )}
                  >
                    {b.type === 'despesa' ? '-' : ''}
                    {formatBRL(b.amountCents)}
                  </td>
                  <td className="px-4 py-3">
                    <BillingStatusBadge status={b.derivedStatus} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <NfStatusBadge status={b.nfStatus} number={b.nfNumber} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <BillingRowActions
                      billing={b}
                      patients={patients}
                      accounts={accounts}
                      cards={cards}
                      categories={categories}
                      role={role}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between pt-1">
          <Button asChild variant="ghost" size="sm" disabled={!hasPrev}>
            <Link href={hasPrev ? toPage(result.page - 1) : '#'}>Anterior</Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {result.page} de {Math.max(1, Math.ceil(result.total / result.pageSize))}
          </span>
          <Button asChild variant="ghost" size="sm" disabled={!hasNext}>
            <Link href={hasNext ? toPage(result.page + 1) : '#'}>Próximo</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
