'use client';

import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  appointmentSchema,
  type AppointmentInput,
} from '@/modules/agenda/schemas/appointment';
import {
  APPOINTMENT_MODALITIES,
  APPOINTMENT_MODALITY_LABELS,
  APPOINTMENT_TYPES,
  EXTRA_PARTICIPANTS,
  EXTRA_PARTICIPANT_LABELS,
} from '@/types/domain';
import {
  createAppointmentAction,
  type CreateAppointmentResult,
} from '@/modules/agenda/actions/create-appointment';
import {
  updateAppointmentAction,
  type UpdateAppointmentResult,
} from '@/modules/agenda/actions/update-appointment';
import type { Appointment, Professional, Room } from '@/types/domain';

const APPOINTMENT_TYPE_LABEL: Record<(typeof APPOINTMENT_TYPES)[number], string> = {
  pacote:      'Sessão do pacote',
  reposicao:   'Reposição de sessão',
  extra:       'Sessão extra / com participante',
  compromisso: 'Compromisso',
};

type Mode =
  | { kind: 'create'; defaultDate?: Date; makeupFor?: Appointment }
  | { kind: 'edit'; appointment: Appointment };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  professionals: Professional[];
  rooms: Room[];
  patients: { id: string; fullName: string }[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (id: string) => void;
};

function toLocalInput(d: Date): string {
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

function defaultValues(mode: Mode): AppointmentInput {
  if (mode.kind === 'edit') {
    return {
      patientId: mode.appointment.patientId ?? '',
      professionalId: mode.appointment.professionalId,
      roomId: mode.appointment.roomId ?? '',
      startsAt: toLocalInput(new Date(mode.appointment.startsAt)),
      endsAt: toLocalInput(new Date(mode.appointment.endsAt)),
      notes: mode.appointment.notes ?? '',
      type: mode.appointment.type,
      makeupForId: mode.appointment.makeupForId ?? '',
      extraParticipant: mode.appointment.extraParticipant ?? '',
      modality: mode.appointment.modality ?? null,
      recurring: false,
      repeatEvery: 1,
      repeatUnit: 'week',
      occurrences: 8,
    };
  }
  const base = mode.defaultDate ?? new Date();
  const start = new Date(base);
  start.setMinutes(0, 0, 0);
  start.setHours(Math.max(8, start.getHours()));
  const end = new Date(start.getTime() + 60 * 60_000);
  const makeupFor = mode.makeupFor;
  return {
    patientId: makeupFor?.patientId ?? '',
    professionalId: makeupFor?.professionalId ?? '',
    roomId: makeupFor?.roomId ?? '',
    startsAt: toLocalInput(start),
    endsAt: toLocalInput(end),
    notes: '',
    type: makeupFor ? 'reposicao' : 'pacote',
    makeupForId: makeupFor?.id ?? '',
    extraParticipant: '',
    modality: 'presencial',
    recurring: false,
    repeatEvery: 1,
    repeatUnit: 'week',
    occurrences: 8,
  };
}

export function AppointmentForm({
  mode,
  trigger,
  professionals,
  rooms,
  patients,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: defaultValues(mode),
  });

  useEffect(() => {
    if (open) form.reset(defaultValues(mode));
  }, [open, mode, form]);

  const isEdit = mode.kind === 'edit';
  type CombinedResult = CreateAppointmentResult | UpdateAppointmentResult;
  const action: (prev: CombinedResult | null, fd: FormData) => Promise<CombinedResult> = isEdit
    ? (prev, fd) => updateAppointmentAction(mode.appointment.id, prev, fd)
    : (prev, fd) => createAppointmentAction(prev as CreateAppointmentResult | null, fd);

  const [state, formAction, pending] = useActionState<CombinedResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      const data = state.data as { id: string; createdCount?: number; skippedCount?: number };
      const created = data.createdCount ?? 1;
      const skipped = data.skippedCount ?? 0;
      if (created > 1) {
        toast.success(`${created} agendamentos criados.${skipped > 0 ? ` ${skipped} ignorado(s) por conflito.` : ''}`);
      } else {
        toast.success(isEdit ? 'Agendamento atualizado.' : 'Agendamento criado.');
      }
      setOpen(false);
      onSuccess?.(state.data.id);
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    if (data.patientId) fd.set('patientId', data.patientId);
    fd.set('professionalId', data.professionalId);
    if (data.roomId) fd.set('roomId', data.roomId);
    fd.set('startsAt', new Date(data.startsAt).toISOString());
    fd.set('endsAt', new Date(data.endsAt).toISOString());
    if (data.notes) fd.set('notes', data.notes);
    fd.set('type', data.type);
    if (data.makeupForId) fd.set('makeupForId', data.makeupForId);
    if (data.extraParticipant) fd.set('extraParticipant', data.extraParticipant);
    if (data.modality) fd.set('modality', data.modality);
    if (!isEdit && data.recurring) {
      fd.set('recurring', 'on');
      fd.set('repeatEvery', String(data.repeatEvery));
      fd.set('repeatUnit', data.repeatUnit);
      fd.set('occurrences', String(data.occurrences));
    }
    startTransition(() => formAction(fd));
  });

  const recurring = form.watch('recurring');
  const appointmentType = form.watch('type');
  const isCompromisso = appointmentType === 'compromisso';
  const isReposicao = appointmentType === 'reposicao';
  const isExtra = appointmentType === 'extra';

  const makeupOriginalDate =
    mode.kind === 'create' && mode.makeupFor
      ? new Date(mode.makeupFor.startsAt)
      : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar agendamento' : 'Novo agendamento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>

            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de sessão</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {APPOINTMENT_TYPE_LABEL[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título do compromisso */}
            {isCompromisso ? (
              <FormField
                control={form.control}
                name="extraParticipant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do compromisso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Reunião de equipe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Cliente */}
            {!isCompromisso ? (
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.length === 0 ? (
                          <SelectItem value="__none__" disabled>
                            Nenhum cliente ativo — cadastre um antes
                          </SelectItem>
                        ) : (
                          patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.fullName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Participante adicional (extra) */}
            {isExtra ? (
              <FormField
                control={form.control}
                name="extraParticipant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participante adicional</FormLabel>
                    <Select
                      value={field.value && field.value.length > 0 ? field.value : '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o participante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Somente o cliente</SelectItem>
                        {EXTRA_PARTICIPANTS.map((ep) => (
                          <SelectItem key={ep} value={ep}>
                            {EXTRA_PARTICIPANT_LABELS[ep]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Campos de reposição */}
            {isReposicao ? (
              <div className="rounded-md border bg-amber-500/5 border-amber-500/30 p-3 space-y-2">
                <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
                  Reposição de sessão
                </p>
                {makeupOriginalDate ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Sessão faltada originalmente</p>
                    <p className="text-sm font-medium rounded-md border bg-muted/40 px-3 py-2">
                      {makeupOriginalDate.toLocaleDateString('pt-BR', {
                        weekday: 'long', day: '2-digit', month: '2-digit',
                        year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      A nova data de reposição será definida nos campos de horário abaixo.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Profissional + Sala */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terapeuta</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala (opcional)</FormLabel>
                    <Select
                      value={field.value && field.value.length > 0 ? field.value : '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sem sala" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sem sala</SelectItem>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Modalidade */}
            {!isCompromisso ? (
              <FormField
                control={form.control}
                name="modality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade de atendimento</FormLabel>
                    <Select
                      value={field.value ?? '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? null : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Não definida</SelectItem>
                        {APPOINTMENT_MODALITIES.map((m) => (
                          <SelectItem key={m} value={m}>
                            {APPOINTMENT_MODALITY_LABELS[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Data/hora */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isReposicao ? 'Nova data de reposição' : 'Início'}</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Término</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recorrência */}
            {!isEdit ? (
              <div className="rounded-md border bg-muted/30 p-4">
                <FormField
                  control={form.control}
                  name="recurring"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-y-0 gap-2">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          aria-label="Agendamento recorrente"
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="cursor-pointer font-medium">
                          Agendamento recorrente
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Cria múltiplos agendamentos no mesmo horário.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                {recurring ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="repeatEvery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repetir a cada</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={52} {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 1)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repeatUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="day">Dia(s)</SelectItem>
                              <SelectItem value="week">Semana(s)</SelectItem>
                              <SelectItem value="month">Mês(es)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="occurrences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={104} {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 1)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending || (!isCompromisso && patients.length === 0)}>
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar agendamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
