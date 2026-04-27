import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/constants/routes';
import type { Appointment } from '@/types/domain';

const STATUS_STYLE: Record<Appointment['status'], string> = {
  agendado: 'bg-muted text-muted-foreground',
  confirmado: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  realizado: 'bg-primary/15 text-primary',
  cancelado: 'bg-destructive/10 text-destructive',
  faltou: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

const STATUS_LABEL: Record<Appointment['status'], string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
};

export function UpcomingAppointments({ items }: { items: Appointment[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Próximos atendimentos</CardTitle>
          <p className="text-sm text-muted-foreground">Agenda de hoje</p>
        </div>
        <Link
          href={routes.agenda}
          className="text-sm text-primary hover:underline"
        >
          Ver agenda
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum atendimento restante hoje.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {a.patientName ?? 'Paciente'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.professionalName ?? 'Profissional'}
                    {a.roomName ? ` · ${a.roomName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLE[a.status],
                    )}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                  <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums">
                    {format(new Date(a.startsAt), 'HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
