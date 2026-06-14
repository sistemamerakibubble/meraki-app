import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import type { Appointment } from '@/types/domain';

// Cores de fundo do card
const STATUS_STYLES: Record<Appointment['status'], string> = {
  agendado:    'border-orange-300/60  bg-orange-50   dark:border-orange-500/40 dark:bg-orange-500/10',
  confirmado:  'border-sky-300/60     bg-sky-50      dark:border-sky-500/40    dark:bg-sky-500/10',
  realizado:   'border-green-400/70    bg-green-100   dark:border-green-500/40   dark:bg-green-500/15',
  cancelado:   'border-muted/60       bg-muted/20    opacity-60',
  faltou:      'border-red-300/60     bg-red-50      dark:border-red-500/40    dark:bg-red-500/10',
  reagendado:  'border-teal-400/60    bg-teal-50     dark:border-teal-500/40   dark:bg-teal-500/10',
};

// Ponto de cor (dot) na badge de status
const STATUS_DOT: Record<Appointment['status'], string> = {
  agendado:   'bg-orange-400',
  confirmado: 'bg-sky-400',
  realizado:  'bg-green-600',
  cancelado:  'bg-muted-foreground/40',
  faltou:     'bg-red-500',
  reagendado: 'bg-teal-500',
};

const STATUS_LABELS: Record<Appointment['status'], string> = {
  agendado:   'Agendado',
  confirmado: 'Confirmado',
  realizado:  'Realizado',
  cancelado:  'Cancelado',
  faltou:     'Faltou',
  reagendado: 'Reagendado',
};

const TYPE_LABEL: Record<string, string> = {
  pacote:      'Pacote',
  reposicao:   'Reposição',
  extra:       'Extra',
  compromisso: 'Compromisso',
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
        'w-full rounded-md border p-2 text-left text-sm transition-colors hover:brightness-95',
        STATUS_STYLES[appointment.status],
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-semibold text-xs tabular-nums text-foreground/80">
          {format(start, 'HH:mm', { locale: ptBR })}–{format(end, 'HH:mm', { locale: ptBR })}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', STATUS_DOT[appointment.status])} />
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>
      <div className="truncate font-semibold text-sm leading-tight">
        {appointment.type === 'compromisso'
          ? (appointment.title ?? 'Compromisso')
          : (appointment.patientName ?? 'Cliente')}
      </div>
      {appointment.type === 'reposicao' && appointment.makeupForDate ? (
        <div className="mt-0.5 text-xs text-amber-700 font-medium truncate">
          Reposição do dia {format(new Date(appointment.makeupForDate), 'dd/MM/yy', { locale: ptBR })}
        </div>
      ) : null}
      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
        <span className="truncate">{appointment.professionalName ?? ''}</span>
        {appointment.type !== 'pacote' ? (
          <span className="ml-auto shrink-0 rounded bg-background/60 px-1 py-0.5 text-[10px] font-medium">
            {TYPE_LABEL[appointment.type] ?? appointment.type}
          </span>
        ) : null}
      </div>
    </button>
  );
}
