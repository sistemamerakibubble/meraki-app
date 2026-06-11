import type { Metadata } from 'next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AgendaToolbar } from '@/modules/agenda/components/AgendaToolbar';
import { WeekGrid } from '@/modules/agenda/components/WeekGrid';
import { DayGrid } from '@/modules/agenda/components/DayGrid';
import { NewAppointmentButton } from '@/modules/agenda/components/NewAppointmentButton';
import { listAppointmentsInRange } from '@/modules/agenda/queries/listAppointmentsInRange';
import { listProfessionals } from '@/modules/agenda/queries/listProfessionals';
import { listRooms } from '@/modules/agenda/queries/listRooms';
import { listActivePatients } from '@/modules/agenda/queries/listActivePatients';
import {
  buildDayRange,
  buildWeekRange,
  parseDateParam,
} from '@/modules/agenda/utils/buildWeekRange';
import { APPOINTMENT_STATUSES, type AppointmentStatus } from '@/types/domain';

export const metadata: Metadata = { title: 'Agenda' };

type SearchParams = Promise<{
  view?: string;
  date?: string;
  professional?: string;
  room?: string;
  status?: string;
}>;

function parseView(value?: string): 'dia' | 'semana' {
  return value === 'dia' ? 'dia' : 'semana';
}

function parseStatus(value?: string): AppointmentStatus | undefined {
  if (value && (APPOINTMENT_STATUSES as readonly string[]).includes(value)) {
    return value as AppointmentStatus;
  }
  return undefined;
}

export default async function AgendaPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const view = parseView(sp.view);
  const cursor = parseDateParam(sp.date);
  const weekRange = buildWeekRange(cursor);
  const dayRange = buildDayRange(cursor);
  const range = view === 'semana' ? weekRange : dayRange;

  const filter = {
    professionalId: sp.professional || undefined,
    roomId: sp.room || undefined,
    status: parseStatus(sp.status),
  };

  const [appointments, professionals, rooms, patients] = await Promise.all([
    listAppointmentsInRange({
      start: range.start,
      end: range.end,
      professionalId: filter.professionalId,
      roomId: filter.roomId,
      status: filter.status,
    }),
    listProfessionals(),
    listRooms(),
    listActivePatients(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Agenda Médica</h1>
          <p className="text-muted-foreground">
            Gerencie e agende as consultas dos pacientes
          </p>
        </div>
        <NewAppointmentButton
          defaultDate={cursor}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Novo agendamento
            </Button>
          }
        />
      </header>

      <AgendaToolbar
        view={view}
        date={cursor}
        professionals={professionals}
        rooms={rooms}
        filter={filter}
      />

      {view === 'semana' ? (
        <WeekGrid
          days={weekRange.days}
          appointments={appointments}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
        />
      ) : (
        <DayGrid
          day={cursor}
          appointments={appointments}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
        />
      )}
    </div>
  );
}
