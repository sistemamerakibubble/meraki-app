'use client';

import { useState } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { AppointmentCard } from '@/modules/agenda/components/AppointmentCard';
import { AppointmentDetail } from '@/modules/agenda/components/AppointmentDetail';
import { cn } from '@/lib/utils/cn';
import type { Appointment, Professional, Room } from '@/types/domain';

export function WeekGrid({
  days,
  appointments,
  professionals,
  rooms,
  patients,
}: {
  days: Date[];
  appointments: Appointment[];
  professionals: Professional[];
  rooms: Room[];
  patients: { id: string; fullName: string }[];
}) {
  const [selected, setSelected] = useState<Appointment | null>(null);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-7">
        {days.map((day) => {
          const dayAppts = appointments.filter((a) => isSameDay(new Date(a.startsAt), day));
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-col gap-2 rounded-lg border bg-card p-3',
                isToday(day) && 'border-primary/60',
              )}
            >
              <header className="flex items-baseline justify-between border-b pb-2">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {format(day, 'EEE', { locale: ptBR })}
                </span>
                <span
                  className={cn(
                    'text-lg font-semibold',
                    isToday(day) && 'text-primary',
                  )}
                >
                  {format(day, 'dd', { locale: ptBR })}
                </span>
              </header>
              <div className="flex flex-col gap-2">
                {dayAppts.length === 0 ? (
                  <p className="py-2 text-center text-xs text-muted-foreground">—</p>
                ) : (
                  dayAppts.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appointment={a}
                      onClick={() => setSelected(a)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected ? (
        <AppointmentDetail
          appointment={selected}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
          open
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        />
      ) : null}
    </>
  );
}
