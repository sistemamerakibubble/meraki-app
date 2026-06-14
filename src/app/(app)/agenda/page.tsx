import type { Metadata } from 'next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AgendaToolbar } from '@/modules/agenda/components/AgendaToolbar';
import { WeekGrid } from '@/modules/agenda/components/WeekGrid';
import { DayGrid } from '@/modules/agenda/components/DayGrid';
import { MonthGrid } from '@/modules/agenda/components/MonthGrid';
import { NewAppointmentButton } from '@/modules/agenda/components/NewAppointmentButton';
import { listAppointmentsInRange } from '@/modules/agenda/queries/listAppointmentsInRange';
import { listProfessionals } from '@/modules/agenda/queries/listProfessionals';
import { listRooms } from '@/modules/agenda/queries/listRooms';
import { listActivePatients } from '@/modules/agenda/queries/listActivePatients';
import {
  buildDayRange,
  buildMonthRange,
  buildWeekRange,
  parseDateParam,
} from '@/modules/agenda/utils/buildWeekRange';
import {
  APPOINTMENT_MODALITIES,
  APPOINTMENT_STATUSES,
  type AppointmentModality,
  type AppointmentStatus,
} from '@/types/domain';

export const metadata: Metadata = { title: 'Agenda' };

type SearchParams = Promise<{
  view?: string;
  date?: string;
  professional?: string;
  room?: string;
  status?: string;
  modality?: string;
  tab?: string;
}>;

function parseView(value?: string): 'dia' | 'semana' | 'mes' {
  if (value === 'dia') return 'dia';
  if (value === 'mes') return 'mes';
  return 'semana';
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
  const monthRange = buildMonthRange(cursor);

  const range =
    view === 'semana' ? weekRange :
    view === 'mes' ? { start: monthRange.start, end: monthRange.end } :
    dayRange;

  const filter = {
    professionalId: sp.professional || undefined,
    roomId: sp.room || undefined,
    status: parseStatus(sp.status),
    modality: (sp.modality && (APPOINTMENT_MODALITIES as readonly string[]).includes(sp.modality)
      ? sp.modality as AppointmentModality
      : undefined),
  };

  const [appointments, professionals, rooms, patients] = await Promise.all([
    listAppointmentsInRange({
      start: range.start,
      end: range.end,
      professionalId: filter.professionalId,
      roomId: filter.roomId,
      status: filter.status,
      modality: filter.modality,
    }),
    listProfessionals(),
    listRooms(),
    listActivePatients(),
  ]);

  // Separar compromissos de sessões
  const sessoes = appointments.filter((a) => a.type !== 'compromisso');
  const compromissos = appointments.filter((a) => a.type === 'compromisso');
  const tab = sp.tab === 'compromissos' ? 'compromissos' : 'agenda';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Agenda</h1>
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

      {/* Tabs Agenda / Compromissos */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
        <a
          href={`/agenda?view=${view}&date=${sp.date ?? ''}`}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${tab === 'agenda' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Sessões
        </a>
        <a
          href={`/agenda?view=${view}&date=${sp.date ?? ''}&tab=compromissos`}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${tab === 'compromissos' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Compromissos
        </a>
      </div>

      <AgendaToolbar
        view={view}
        date={cursor}
        professionals={professionals}
        rooms={rooms}
        filter={filter}
      />

      {tab === 'agenda' ? (
        <>
          {view === 'semana' ? (
            <WeekGrid
              days={weekRange.days}
              appointments={sessoes}
              professionals={professionals}
              rooms={rooms}
              patients={patients}
            />
          ) : view === 'mes' ? (
            <MonthGrid
              cursor={cursor}
              weeks={monthRange.weeks}
              appointments={sessoes}
              professionals={professionals}
              rooms={rooms}
              patients={patients}
            />
          ) : (
            <DayGrid
              day={cursor}
              appointments={sessoes}
              professionals={professionals}
              rooms={rooms}
              patients={patients}
            />
          )}
        </>
      ) : (
        /* Tab Compromissos */
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Compromissos</h2>
            <NewAppointmentButton
              defaultDate={cursor}
              professionals={professionals}
              rooms={rooms}
              patients={patients}
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="mr-1.5 h-4 w-4" /> Novo compromisso
                </Button>
              }
            />
          </div>
          {compromissos.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum compromisso neste período.
            </p>
          ) : (
            <div className="divide-y">
              {compromissos.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{c.title ?? 'Compromisso'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.startsAt).toLocaleDateString('pt-BR', {
                        weekday: 'short', day: '2-digit', month: '2-digit',
                      })}
                      {' às '}
                      {new Date(c.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {c.professionalName ? ` · ${c.professionalName}` : ''}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === 'realizado' ? 'bg-primary/15 text-primary' :
                    c.status === 'cancelado' ? 'bg-destructive/15 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
