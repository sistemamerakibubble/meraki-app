'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Pencil, Trash2, Check, X, CalendarPlus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AppointmentForm } from '@/modules/agenda/components/AppointmentForm';
import { changeAppointmentStatusAction } from '@/modules/agenda/actions/change-appointment-status';
import { deleteAppointmentsBatchAction } from '@/modules/agenda/actions/delete-appointments-batch';
import { listPatientUpcomingAppointments } from '@/modules/agenda/queries/listPatientUpcomingAppointments';
import type { Appointment, Professional, Room } from '@/types/domain';

const STATUS_LABEL: Record<Appointment['status'], string> = {
  agendado:   'Agendado',
  confirmado: 'Confirmado',
  realizado:  'Realizado',
  cancelado:  'Cancelado',
  faltou:     'Faltou',
  reagendado: 'Reagendado',
};

const STATUS_BADGE: Record<Appointment['status'], string> = {
  agendado:   'bg-orange-100 text-orange-700',
  confirmado: 'bg-sky-100 text-sky-700',
  realizado:  'bg-green-200 text-green-800',
  cancelado:  'bg-muted text-muted-foreground',
  faltou:     'bg-red-100 text-red-700',
  reagendado: 'bg-teal-100 text-teal-700',
};

const TYPE_LABEL: Record<string, string> = {
  pacote: 'Sessão do pacote',
  reposicao: 'Reposição',
  extra: 'Sessão extra',
  compromisso: 'Compromisso',
};

type UpcomingItem = {
  id: string;
  startsAt: string;
  endsAt: string;
  type: string;
  status: string;
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

  // Desmarcou
  const [showDesmarcou, setShowDesmarcou] = useState(false);
  const [desmarcouQuem, setDesmarcouQuem] = useState<'cliente' | 'terapeuta' | ''>('');

  // Exclusão em lote
  const [showDelete, setShowDelete] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const close = () => onOpenChange(false);

  const runChange = (next: Appointment['status'], successMsg: string) => {
    startTransition(async () => {
      const result = await changeAppointmentStatusAction(appointment.id, next);
      if (result.ok) { toast.success(successMsg); close(); }
      else toast.error(result.error);
    });
  };

  const handleDesmarcou = () => {
    if (!desmarcouQuem) { toast.error('Selecione quem desmarcou.'); return; }
    startTransition(async () => {
      const result = await changeAppointmentStatusAction(appointment.id, 'faltou');
      if (result.ok) {
        toast.success(`Marcado como faltou — ${desmarcouQuem === 'cliente' ? 'cliente' : 'terapeuta'}.`);
        close();
      } else toast.error(result.error);
    });
  };

  const openDeletePanel = async () => {
    setShowDelete(true);
    // Pré-seleciona o agendamento atual
    setSelectedIds(new Set([appointment.id]));

    if (appointment.patientId) {
      setLoadingUpcoming(true);
      const items = await listPatientUpcomingAppointments(appointment.patientId);
      setUpcoming(items);
      setLoadingUpcoming(false);
    }
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === upcoming.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(upcoming.map((u) => u.id)));
    }
  };

  const handleDeleteBatch = () => {
    if (selectedIds.size === 0) { toast.error('Selecione ao menos um agendamento.'); return; }
    startTransition(async () => {
      const result = await deleteAppointmentsBatchAction([...selectedIds]);
      if (result.ok) {
        toast.success(
          result.data.count === 1
            ? 'Agendamento excluído.'
            : `${result.data.count} agendamentos excluídos.`,
        );
        close();
      } else {
        toast.error(result.error);
      }
    });
  };

  const start = new Date(appointment.startsAt);
  const end = new Date(appointment.endsAt);

  return (
    <>
      <Dialog open={open && !editing && !makingUp} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {appointment.type === 'compromisso'
                ? (appointment.title ?? 'Compromisso')
                : (appointment.patientName ?? 'Atendimento')}
            </DialogTitle>
          </DialogHeader>

          {/* Info principal */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[appointment.status]}`}>
                {STATUS_LABEL[appointment.status]}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {TYPE_LABEL[appointment.type] ?? appointment.type}
              </span>
            </div>

            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Data e hora</dt>
                <dd className="font-medium text-right">
                  {format(start, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  {' – '}
                  {format(end, 'HH:mm', { locale: ptBR })}
                </dd>
              </div>
              {appointment.type !== 'compromisso' && appointment.patientName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="font-medium">{appointment.patientName}</dd>
                </div>
              ) : null}
              {appointment.professionalName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Terapeuta</dt>
                  <dd className="font-medium">{appointment.professionalName}</dd>
                </div>
              ) : null}
              {appointment.roomName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Local</dt>
                  <dd className="font-medium">{appointment.roomName}</dd>
                </div>
              ) : null}
              {appointment.notes ? (
                <div>
                  <dt className="text-muted-foreground mb-1">Observações</dt>
                  <dd className="whitespace-pre-wrap rounded-md border bg-muted/40 p-2.5 text-sm">
                    {appointment.notes}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {/* ── Desmarcou ── */}
          {showDesmarcou ? (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <p className="text-sm font-medium">Quem desmarcou?</p>
              <Select value={desmarcouQuem} onValueChange={(v) => setDesmarcouQuem(v as 'cliente' | 'terapeuta')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="terapeuta">Terapeuta</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDesmarcou} disabled={pending || !desmarcouQuem}>
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Confirmar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowDesmarcou(false); setDesmarcouQuem(''); }}>
                  <X className="mr-1.5 h-3.5 w-3.5" /> Cancelar
                </Button>
              </div>
            </div>
          ) : null}

          {/* ── Painel de exclusão em lote ── */}
          {showDelete ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 space-y-3 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-destructive">Selecionar sessões para excluir</p>
                <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setShowDelete(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {loadingUpcoming ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando sessões agendadas...
                </div>
              ) : upcoming.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Nenhuma sessão futura agendada encontrada. Apenas este agendamento será excluído.
                  </p>
                  <div className="flex items-center gap-2 rounded border bg-background p-2">
                    <Checkbox checked onCheckedChange={() => {}} />
                    <span className="text-sm font-medium">
                      {format(start, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {' — '}
                      <span className="text-muted-foreground">{TYPE_LABEL[appointment.type]}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Sessões agendadas e confirmadas futuras de{' '}
                    <span className="font-medium">{appointment.patientName}</span>.
                    Selecione as que deseja excluir.
                  </p>

                  {/* Selecionar todos */}
                  <div
                    className="flex items-center gap-2 cursor-pointer rounded border bg-background px-2 py-1.5 hover:bg-accent/30"
                    onClick={toggleAll}
                  >
                    <Checkbox
                      checked={selectedIds.size === upcoming.length && upcoming.length > 0}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Selecionar todas ({upcoming.length})
                    </span>
                  </div>

                  {/* Lista */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {upcoming.map((u) => {
                      const uStart = new Date(u.startsAt);
                      const uEnd = new Date(u.endsAt);
                      const isCurrentAppt = u.id === appointment.id;
                      return (
                        <div
                          key={u.id}
                          className={`flex items-center gap-2 cursor-pointer rounded border px-2 py-1.5 transition-colors ${
                            selectedIds.has(u.id)
                              ? 'border-destructive/40 bg-destructive/10'
                              : 'bg-background hover:bg-accent/30'
                          }`}
                          onClick={() => toggleId(u.id)}
                        >
                          <Checkbox
                            checked={selectedIds.has(u.id)}
                            onCheckedChange={() => toggleId(u.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">
                              {format(uStart, 'EEE dd/MM/yyyy', { locale: ptBR })}
                              {' '}
                              {format(uStart, 'HH:mm')}–{format(uEnd, 'HH:mm')}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {TYPE_LABEL[u.type] ?? u.type}
                              {isCurrentAppt ? ' · este agendamento' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 border-t">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteBatch}
                  disabled={pending || selectedIds.size === 0}
                >
                  {pending ? (
                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Excluindo...</>
                  ) : (
                    <>Excluir {selectedIds.size > 0 ? `${selectedIds.size} sessão${selectedIds.size > 1 ? 'ões' : ''}` : ''}</>
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowDelete(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}

          {/* ── Ações principais ── */}
          {!showDesmarcou && !showDelete ? (
            <div className="flex flex-wrap gap-2 border-t pt-4">
              {appointment.status !== 'confirmado' && appointment.status !== 'realizado' && appointment.status !== 'cancelado' ? (
                <Button size="sm" variant="outline" disabled={pending}
                  onClick={() => runChange('confirmado', 'Agendamento confirmado.')}>
                  Confirmar
                </Button>
              ) : null}
              {appointment.status !== 'realizado' && appointment.status !== 'cancelado' ? (
                <Button size="sm" variant="outline" disabled={pending}
                  onClick={() => runChange('realizado', 'Sessão registrada como realizada.')}>
                  Realizado
                </Button>
              ) : null}
              {appointment.status !== 'faltou' && appointment.status !== 'cancelado' ? (
                <Button size="sm" variant="outline" disabled={pending}
                  onClick={() => setShowDesmarcou(true)}>
                  Desmarcou
                </Button>
              ) : null}
              {appointment.status === 'faltou' ? (
                <Button size="sm" variant="outline" disabled={pending}
                  onClick={() => setMakingUp(true)}>
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Agendar reposição
                </Button>
              ) : null}
              {appointment.status !== 'cancelado' ? (
                <Button size="sm" variant="outline" disabled={pending}
                  onClick={() => runChange('cancelado', 'Agendamento cancelado.')}
                  className="text-destructive hover:text-destructive">
                  Cancelar
                </Button>
              ) : null}

              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={pending}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openDeletePanel}
                  disabled={pending}
                  className="text-destructive hover:text-destructive border-destructive/40"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {editing ? (
        <AppointmentForm
          mode={{ kind: 'edit', appointment }}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
          open
          onOpenChange={(next) => { if (!next) { setEditing(false); close(); } }}
          onSuccess={() => { setEditing(false); close(); }}
        />
      ) : null}

      {makingUp ? (
        <AppointmentForm
          mode={{ kind: 'create', makeupFor: appointment }}
          professionals={professionals}
          rooms={rooms}
          patients={patients}
          open
          onOpenChange={(next) => { if (!next) { setMakingUp(false); close(); } }}
          onSuccess={() => { setMakingUp(false); close(); }}
        />
      ) : null}
    </>
  );
}
