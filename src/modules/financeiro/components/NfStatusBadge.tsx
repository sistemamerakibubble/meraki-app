import { cn } from '@/lib/utils/cn';
import type { NfStatus } from '@/types/domain';

const LABEL: Record<NfStatus, string> = {
  pendente: 'NF pendente',
  emitida: 'NF emitida',
};

const CLASS: Record<NfStatus, string> = {
  pendente: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  emitida: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

export function NfStatusBadge({ status, number }: { status: NfStatus; number?: string | null }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        CLASS[status],
      )}
      title={number ?? undefined}
    >
      {LABEL[status]}
      {status === 'emitida' && number ? ` · ${number}` : ''}
    </span>
  );
}
