'use client';

import { useState } from 'react';
import { format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { AppointmentDetail } from '@/modules/agenda/components/AppointmentDetail';
import { cn } from '@/lib/utils/cn';
import type { Appointment, Professional, Room } from '@/types/domain';

const STATUS_DOT: Record<Appointment['status'], string> = {
  agendado:   'bg-orange-400',
  confirmado: 'bg-sky-400',
  realizado:  'bg-green-600',
  cancelado:  'bg-muted-foreground/40',
  faltou:     'bg-red-500',
  reagendado: 'bg-teal-500',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function MonthGrid({
  cursor,
  weeks,
  appointments,
  professionals,
  rooms,
  patients,
}: {
  cursor: Date;
  weeks: Date[][];
  appointments: Appointment[];
  professionals: Professional[];
  rooms: Room[];
  patients: { id: string; fullName: string }[];
}) {
  const [selected, setSelected] = useState<Appointment | null>(null);

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Semanas */}
        <div className="divide-y">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 divide-x">
              {week.map((day) => {
                const dayAppts = appointments.filter((a) => isSameDay(new Date(a.startsAt), day));
                const inMonth = isSameMonth(day, cursor);
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-[100px] p-1.5 flex flex-col gap-1',
                      !inMonth && 'bg-muted/20 text-muted-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold self-start',
                        isToday(day) && 'bg-primary text-primary-foreground',
                        !isToday(day) && !inMonth && 'text-muted-foreground/50',
                        !isToday(day) && inMonth && 'text-foreground',
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    <div className="flex flex-col gap-0.5">
                      {dayAppts.slice(0, 3).map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelected(a)}
                          className={cn(
                            'flex items-center gap-1 rounded px-1 py-0.5 text-left text-xs hover:bg-accent/50 transition-colors w-full truncate',
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', STATUS_DOT[a.status])} />
                          <span className="truncate font-medium">
                            {format(new Date(a.startsAt), 'HH:mm')}
                            {' '}
                            {a.type === 'compromisso' ? (a.title ?? 'Compromisso') : (a.patientName ?? 'Paciente')}
                          </span>
                        </button>
                      ))}
                      {dayAppts.length > 3 ? (
                        <span className="text-xs text-muted-foreground px-1">
                          +{dayAppts.length - 3} mais
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <AppointmentDetail
          appointment={selected}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
          open
          onOpenChange={(open) => { if (!open) setSelected(null); }}
        />
      ) : null}
    </>
  );
}
