import { cn } from '@/lib/utils/cn';
import type { SupervisionStatus } from '@/types/domain';

const LABEL: Record<SupervisionStatus, string> = {
  pendente: 'Pendente',
  em_revisao: 'Em revisão',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const CLASS: Record<SupervisionStatus, string> = {
  pendente: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  em_revisao: 'bg-primary/15 text-primary',
  concluida: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelada: 'bg-muted text-muted-foreground',
};

export function SupervisionStatusBadge({ status }: { status: SupervisionStatus }) {
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
