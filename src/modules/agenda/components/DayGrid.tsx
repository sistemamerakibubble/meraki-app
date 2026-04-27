'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { AppointmentCard } from '@/modules/agenda/components/AppointmentCard';
import { AppointmentDetail } from '@/modules/agenda/components/AppointmentDetail';
import type { Appointment, Professional, Room } from '@/types/domain';

export function DayGrid({
  day,
  appointments,
  professionals,
  rooms,
  patients,
}: {
  day: Date;
  appointments: Appointment[];
  professionals: Professional[];
  rooms: Room[];
  patients: { id: string; fullName: string }[];
}) {
  const [selected, setSelected] = useState<Appointment | null>(null);

  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <header className="mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold">
            {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h2>
        </header>
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum agendamento neste dia.
          </p>
        ) : (
          <div className="grid gap-2">
            {appointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} onClick={() => setSelected(a)} />
            ))}
          </div>
        )}
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
