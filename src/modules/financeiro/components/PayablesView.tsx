'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { formatBRL } from '@/lib/utils/money';
import { formatDate } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';
import { markBillingPaidAction } from '@/modules/financeiro/actions/change-billing-status';
import type { Billing, ExpenseCategory } from '@/types/domain';
import type { UpcomingPayablesResult } from '@/modules/financeiro/queries/listUpcomingPayables';

type Props = {
  data: UpcomingPayablesResult;
  categories: ExpenseCategory[];
};

type GroupProps = {
  title: string;
  billings: Billing[];
  categories: ExpenseCategory[];
  variant?: 'danger' | 'warning' | 'default';
  defaultOpen?: boolean;
};

function categoryFor(b: Billing, cats: ExpenseCategory[]) {
  if (!b.expenseCategoryId) return null;
  return cats.find((c) => c.id === b.expenseCategoryId) ?? null;
}

function BillingRow({
  billing,
  categories,
}: {
  billing: Billing;
  categories: ExpenseCategory[];
}) {
  const [, startTransition] = useTransition();
  const cat = categoryFor(billing, categories);

  function markPaid() {
    startTransition(async () => {
      const r = await markBillingPaidAction(billing.id);
      if (r.ok) toast.success('Marcado como pago.');
      else toast.error(r.error ?? 'Erro');
    });
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {cat ? (
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: cat.color }}
          />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0 bg-muted-foreground/30" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{billing.description}</p>
          <p className="text-xs text-muted-foreground">
            {cat?.name ?? 'Sem categoria'} · Vence {formatDate(billing.dueDate)}
            {billing.installmentCount
              ? ` · Parcela ${billing.installmentNumber}/${billing.installmentCount}`
              : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <span className="text-sm font-semibold">{formatBRL(billing.amountCents)}</span>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={markPaid}>
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Pagar
        </Button>
      </div>
    </div>
  );
}

function BillingGroup({ title, billings, categories, variant = 'default', defaultOpen = true }: GroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (billings.length === 0) return null;

  const total = billings.reduce((s, b) => s + b.amountCents, 0);

  const headerColor =
    variant === 'danger'
      ? 'text-destructive'
      : variant === 'warning'
        ? 'text-amber-600'
        : 'text-foreground';

  return (
    <div className="rounded-lg border overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className={cn('text-sm font-semibold', headerColor)}>{title}</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {billings.length}
          </span>
        </div>
        <span className={cn('text-sm font-semibold', headerColor)}>{formatBRL(total)}</span>
      </button>
      {open ? (
        <div className="divide-y">
          {billings.map((b) => (
            <BillingRow key={b.id} billing={b} categories={categories} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PayablesView({ data, categories }: Props) {
  const { overdue, thisWeek, nextWeek, later, totalPendingCents, overdueCents } = data;
  const total = overdue.length + thisWeek.length + nextWeek.length + later.length;

  return (
    <div className="space-y-4">
      {/* Resumo de alertas */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <CalendarClock className="h-8 w-8 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">A pagar (30 dias)</p>
            <p className="text-2xl font-bold">{formatBRL(totalPendingCents)}</p>
            <p className="text-xs text-muted-foreground">{total} lançamento{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {overdueCents > 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0" />
            <div>
              <p className="text-xs text-destructive uppercase tracking-wide font-medium">Vencidos</p>
              <p className="text-2xl font-bold text-destructive">{formatBRL(overdueCents)}</p>
              <p className="text-xs text-destructive/80">{overdue.length} lançamento{overdue.length !== 1 ? 's' : ''} em atraso</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Situação</p>
              <p className="text-lg font-semibold text-green-700">Em dia</p>
              <p className="text-xs text-green-600">Sem vencimentos atrasados</p>
            </div>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium">Nenhuma despesa pendente nos próximos 30 dias</p>
        </div>
      ) : (
        <div className="space-y-3">
          <BillingGroup
            title="Vencidos"
            billings={overdue}
            categories={categories}
            variant="danger"
            defaultOpen
          />
          <BillingGroup
            title="Esta semana"
            billings={thisWeek}
            categories={categories}
            variant="warning"
            defaultOpen
          />
          <BillingGroup
            title="Próxima semana"
            billings={nextWeek}
            categories={categories}
            defaultOpen
          />
          <BillingGroup
            title="Em 30 dias"
            billings={later}
            categories={categories}
            defaultOpen={false}
          />
        </div>
      )}
    </div>
  );
}
