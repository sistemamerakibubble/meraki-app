import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import type { Appointment } from '@/types/domain';

const STATUS_STYLES: Record<Appointment['status'], string> = {
  agendado: 'border-muted-foreground/30 bg-muted/40',
  confirmado: 'border-emerald-500/40 bg-emerald-500/10',
  realizado: 'border-primary/40 bg-primary/10',
  cancelado: 'border-destructive/30 bg-destructive/10 opacity-70',
  faltou: 'border-amber-500/40 bg-amber-500/10',
};

const STATUS_LABELS: Record<Appointment['status'], string> = {
  agendado: 'agendado',
  confirmado: 'confirmado',
  realizado: 'realizado',
  cancelado: 'cancelado',
  faltou: 'faltou',
};

export function AppointmentCard({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick?: () => void;
}) {
  const start = new Date(appointment.startsAt);
  const end = new Date(appointment.endsAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-md border p-2 text-left text-sm transition-colors hover:bg-accent/40',
        STATUS_STYLES[appointment.status],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          {format(start, 'HH:mm', { locale: ptBR })}–{format(end, 'HH:mm', { locale: ptBR })}
        </span>
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>
      <div className="mt-1 truncate font-semibold">
        {appointment.patientName ?? 'Paciente'}
      </div>
      <div className="truncate text-xs text-muted-foreground">
        {appointment.professionalName ?? 'Profissional'}
        {appointment.roomName ? ` · ${appointment.roomName}` : ''}
      </div>
    </button>
  );
}
