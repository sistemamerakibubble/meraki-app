'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { addDays, addWeeks, format, subDays, subWeeks } from 'date-fns';
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
import type { Professional, Room, AppointmentStatus } from '@/types/domain';
import { APPOINTMENT_STATUSES } from '@/types/domain';

type Props = {
  view: 'dia' | 'semana';
  date: Date;
  professionals: Professional[];
  rooms: Room[];
  filter: {
    professionalId?: string;
    roomId?: string;
    status?: AppointmentStatus;
  };
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
};

export function AgendaToolbar({ view, date, professionals, rooms, filter }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const toUrl = (next: {
    view?: 'dia' | 'semana';
    date?: Date;
    professional?: string | null;
    room?: string | null;
    status?: AppointmentStatus | null;
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
    return `${routes.agenda}?${params.toString()}`;
  };

  const prev = view === 'dia' ? subDays(date, 1) : subWeeks(date, 1);
  const next = view === 'dia' ? addDays(date, 1) : addWeeks(date, 1);

  const label = format(date, "'Semana de' dd 'de' MMMM", { locale: ptBR });

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
      </div>

      <span className="text-sm font-medium text-muted-foreground">{label}</span>

      <div className="ml-auto flex flex-wrap gap-2">
        <Select
          value={filter.professionalId ?? 'all'}
          onValueChange={(v) =>
            router.push(toUrl({ professional: v === 'all' ? null : v }))
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos profissionais</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.roomId ?? 'all'}
          onValueChange={(v) => router.push(toUrl({ room: v === 'all' ? null : v }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Local" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os locais</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.status ?? 'all'}
          onValueChange={(v) =>
            router.push(toUrl({ status: v === 'all' ? null : (v as AppointmentStatus) }))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {APPOINTMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
