'use client';

import type { ReactNode } from 'react';
import { AppointmentForm } from '@/modules/agenda/components/AppointmentForm';
import type { Professional, Room } from '@/types/domain';

export function NewAppointmentButton({
  defaultDate,
  professionals,
  rooms,
  patients,
  trigger,
}: {
  defaultDate?: Date;
  professionals: Professional[];
  rooms: Room[];
  patients: { id: string; fullName: string }[];
  trigger: ReactNode;
}) {
  return (
    <AppointmentForm
      mode={{ kind: 'create', defaultDate }}
      professionals={professionals}
      rooms={rooms}
      patients={patients}
      trigger={trigger}
    />
  );
}
