import { cn } from '@/lib/utils/cn';
import { ROLE_LABELS } from '@/lib/constants/roles';
import type { Role } from '@/types/domain';

const CLASS: Record<Role, string> = {
  admin: 'bg-primary/15 text-primary',
  medico: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  psicoterapeuta: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  psicopedagoga: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  estagiario: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  atendente: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  supervisor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  recepcao: 'bg-muted text-muted-foreground',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        CLASS[role],
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
