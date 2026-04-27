import { cn } from '@/lib/utils/cn';
import type { BillingDerivedStatus } from '@/types/domain';

const LABEL: Record<BillingDerivedStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  cancelado: 'Cancelado',
  atrasado: 'Atrasado',
};

const CLASS: Record<BillingDerivedStatus, string> = {
  pendente: 'bg-muted text-muted-foreground',
  pago: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelado: 'bg-destructive/10 text-destructive',
  atrasado: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

export function BillingStatusBadge({ status }: { status: BillingDerivedStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        CLASS[status],
      )}
    >
      {LABEL[status]}
    </span>
  );
}
