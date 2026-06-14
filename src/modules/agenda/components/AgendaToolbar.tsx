'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { addDays, addMonths, addWeeks, format, subDays, subMonths, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { routes } from '@/lib/constants/routes';
import type { Professional, Room, AppointmentStatus, AppointmentModality } from '@/types/domain';
import { APPOINTMENT_MODALITIES, APPOINTMENT_MODALITY_LABELS, APPOINTMENT_STATUSES } from '@/types/domain';

type View = 'dia' | 'semana' | 'mes';

type Props = {
  view: View;
  date: Date;
  professionals: Professional[];
  rooms: Room[];
  filter: {
    professionalId?: string;
    roomId?: string;
    status?: AppointmentStatus;
    modality?: AppointmentModality;
  };
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado:   'Agendado',
  confirmado: 'Confirmado',
  realizado:  'Realizado',
  cancelado:  'Cancelado',
  faltou:     'Faltou',
  reagendado: 'Reagendado',
};

export function AgendaToolbar({ view, date, professionals, rooms, filter }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const toUrl = (next: {
    view?: View;
    date?: Date;
    professional?: string | null;
    room?: string | null;
    status?: AppointmentStatus | null;
    modality?: AppointmentModality | null;
  }) => {
    const params = new URLSearchParams(sp);
    if (next.view !== undefined) params.set('view', next.view);
    if (next.date !== undefined) params.set('date', format(next.date, 'yyyy-MM-dd'));
    if (next.professional !== undefined) {
      if (next.professional) params.set('professional', next.professional);
      else params.delete('professional');
    }
    if (next.room !== undefined) {
      if (next.room) params.set('room', next.room);
      else params.delete('room');
    }
    if (next.status !== undefined) {
      if (next.status) params.set('status', next.status);
      else params.delete('status');
    }
    if (next.modality !== undefined) {
      if (next.modality) params.set('modality', next.modality);
      else params.delete('modality');
    }
    return `${routes.agenda}?${params.toString()}`;
  };

  const prev =
    view === 'dia' ? subDays(date, 1) :
    view === 'semana' ? subWeeks(date, 1) :
    subMonths(date, 1);

  const next =
    view === 'dia' ? addDays(date, 1) :
    view === 'semana' ? addWeeks(date, 1) :
    addMonths(date, 1);

  const label =
    view === 'mes'
      ? format(date, "MMMM 'de' yyyy", { locale: ptBR })
      : view === 'dia'
      ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : format(date, "'Semana de' dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => router.push(toUrl({ date: new Date() }))}>
          <Calendar className="mr-1 h-4 w-4" /> Hoje
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(toUrl({ date: prev }))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(toUrl({ date: next }))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-md border bg-background p-1">
        <Button
          variant={view === 'dia' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => router.push(toUrl({ view: 'dia' }))}
        >
          Dia
        </Button>
        <Button
          variant={view === 'semana' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => router.push(toUrl({ view: 'semana' }))}
        >
          Semana
        </Button>
        <Button
          variant={view === 'mes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => router.push(toUrl({ view: 'mes' }))}
        >
          Mês
        </Button>
      </div>

      <span className="text-sm font-medium capitalize text-muted-foreground">{label}</span>

      <div className="ml-auto flex flex-wrap gap-2">
        {/* Profissional */}
        <Select
          value={filter.professionalId ?? 'all'}
          onValueChange={(v) => router.push(toUrl({ professional: v === 'all' ? null : v }))}
        >
          <SelectTrigger className="w-44">
            {filter.professionalId
              ? <SelectValue />
              : <span className="text-muted-foreground">Profissional</span>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Modalidade */}
        <Select
          value={filter.modality ?? 'all'}
          onValueChange={(v) => router.push(toUrl({ modality: v === 'all' ? null : (v as AppointmentModality) }))}
        >
          <SelectTrigger className="w-44">
            {filter.modality
              ? <SelectValue />
              : <span className="text-muted-foreground">Modalidade</span>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {APPOINTMENT_MODALITIES.map((m) => (
              <SelectItem key={m} value={m}>{APPOINTMENT_MODALITY_LABELS[m]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sala */}
        <Select
          value={filter.roomId ?? 'all'}
          onValueChange={(v) => router.push(toUrl({ room: v === 'all' ? null : v }))}
        >
          <SelectTrigger className="w-36">
            {filter.roomId
              ? <SelectValue />
              : <span className="text-muted-foreground">Sala</span>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filter.status ?? 'all'}
          onValueChange={(v) => router.push(toUrl({ status: v === 'all' ? null : (v as AppointmentStatus) }))}
        >
          <SelectTrigger className="w-36">
            {filter.status
              ? <SelectValue />
              : <span className="text-muted-foreground">Status</span>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {APPOINTMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
