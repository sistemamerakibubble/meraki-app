'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AppointmentForm } from '@/modules/agenda/components/AppointmentForm';
import { changeAppointmentStatusAction } from '@/modules/agenda/actions/change-appointment-status';
import type { Appointment, Professional, Room } from '@/types/domain';

const STATUS_LABEL: Record<Appointment['status'], string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
};

export function AppointmentDetail({
  appointment,
  professionals,
  rooms,
  patients,
  open,
  onOpenChange,
}: {
  appointment: Appointment;
  professionals: Professional[];
  rooms: Room[];
  patients: { id: string; fullName: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [makingUp, setMakingUp] = useState(false);

  const runChange = (next: Appointment['status'], successMsg: string) => {
    startTransition(async () => {
      const result = await changeAppointmentStatusAction(appointment.id, next);
      if (result.ok) {
        toast.success(successMsg);
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Dialog open={open && !editing && !makingUp} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>

          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Paciente</dt>
              <dd className="font-medium">{appointment.patientName ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Profissional</dt>
              <dd className="font-medium">{appointment.professionalName ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Local</dt>
              <dd className="font-medium">{appointment.roomName ?? 'Sem sala'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Quando</dt>
              <dd className="font-medium">
                {format(new Date(appointment.startsAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
                {' – '}
                {format(new Date(appointment.endsAt), 'HH:mm', { locale: ptBR })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{STATUS_LABEL[appointment.status]}</dd>
            </div>
            {appointment.notes ? (
              <div>
                <dt className="text-muted-foreground">Observações</dt>
                <dd className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">
                  {appointment.notes}
                </dd>
              </div>
            ) : null}
          </dl>

          <DialogFooter className="flex-wrap gap-2 sm:gap-2">
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => runChange('cancelado', 'Agendamento cancelado.')}
              className="text-destructive hover:text-destructive"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => runChange('faltou', 'Paciente marcado como faltou.')}
            >
              Faltou
            </Button>
            <Button
              variant="outline"
              disabled={pending || appointment.status === 'confirmado'}
              onClick={() => runChange('confirmado', 'Agendamento confirmado.')}
            >
              Confirmar
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => runChange('realizado', 'Atendimento registrado como realizado.')}
            >
              Realizado
            </Button>
            {appointment.status === 'faltou' ? (
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => setMakingUp(true)}
              >
                Agendar reposição
              </Button>
            ) : null}
            <Button onClick={() => setEditing(true)} disabled={pending}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editing ? (
        <AppointmentForm
          mode={{ kind: 'edit', appointment }}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
          open
          onOpenChange={(next) => {
            if (!next) {
              setEditing(false);
              onOpenChange(false);
            }
          }}
          onSuccess={() => {
            setEditing(false);
            onOpenChange(false);
          }}
        />
      ) : null}

      {makingUp ? (
        <AppointmentForm
          mode={{ kind: 'create', makeupFor: appointment }}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
          open
          onOpenChange={(next) => {
            if (!next) {
              setMakingUp(false);
              onOpenChange(false);
            }
          }}
          onSuccess={() => {
            setMakingUp(false);
            onOpenChange(false);
          }}
        />
      ) : null}
    </>
  );
}
