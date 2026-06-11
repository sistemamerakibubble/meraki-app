'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SupervisionStatusBadge } from '@/modules/supervisao/components/SupervisionStatusBadge';
import { routes } from '@/lib/constants/routes';
import { formatDate } from '@/lib/utils/dates';
import { SUPERVISION_STATUSES, type Supervision, type SupervisionStatus } from '@/types/domain';

const STATUS_LABELS: Record<SupervisionStatus | 'all', string> = {
  all: 'Todos status',
  pendente: 'Pendente',
  em_revisao: 'Em revisão',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export function SupervisionList({
  supervisions,
  selectedId,
}: {
  supervisions: Supervision[];
  selectedId?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get('status') ?? 'all';

  const setStatus = (v: string) => {
    const params = new URLSearchParams(sp);
    if (v === 'all') params.delete('status');
    else params.set('status', v);
    router.push(`${routes.supervisao}${params.toString() ? `?${params}` : ''}`);
  };

  const openCaso = (id: string) => {
    const params = new URLSearchParams(sp);
    params.set('caso', id);
    router.push(`${routes.supervisao}?${params.toString()}`);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="border-b p-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{STATUS_LABELS.all}</SelectItem>
            {SUPERVISION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="flex-1 overflow-y-auto divide-y">
        {supervisions.length === 0 ? (
          <li className="p-6 text-center text-sm text-muted-foreground">
            Nenhuma supervisão encontrada.
          </li>
        ) : (
          supervisions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => openCaso(s.id)}
                className={cn(
                  'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent/40',
                  s.id === selectedId && 'bg-accent/60',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-1 font-medium">{s.title}</span>
                  <SupervisionStatusBadge status={s.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.patientName ? `Paciente: ${s.patientName} · ` : ''}
                  Profissional: {s.professionalName ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supervisor: {s.supervisorName ?? '—'} · {formatDate(s.createdAt)}
                </p>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
