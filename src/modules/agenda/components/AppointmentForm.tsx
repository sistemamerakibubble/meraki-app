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
  createAppointmentAction,
  type CreateAppointmentResult,
} from '@/modules/agenda/actions/create-appointment';
import {
  updateAppointmentAction,
  type UpdateAppointmentResult,
} from '@/modules/agenda/actions/update-appointment';
import type { Appointment, Professional, Room } from '@/types/domain';

type Mode =
  | { kind: 'create'; defaultDate?: Date }
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
      patientId: mode.appointment.patientId,
      professionalId: mode.appointment.professionalId,
      roomId: mode.appointment.roomId ?? '',
      startsAt: toLocalInput(new Date(mode.appointment.startsAt)),
      endsAt: toLocalInput(new Date(mode.appointment.endsAt)),
      notes: mode.appointment.notes ?? '',
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
  return {
    patientId: '',
    professionalId: '',
    roomId: '',
    startsAt: toLocalInput(start),
    endsAt: toLocalInput(end),
    notes: '',
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
        const baseMsg = `${created} agendamentos criados.`;
        const tail = skipped > 0 ? ` ${skipped} ignorado(s) por conflito.` : '';
        toast.success(baseMsg + tail);
      } else {
        toast.success(isEdit ? 'Agendamento atualizado.' : 'Agendamento criado.');
      }
      setOpen(false);
      onSuccess?.(state.data.id);
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('patientId', data.patientId);
    fd.set('professionalId', data.professionalId);
    if (data.roomId) fd.set('roomId', data.roomId);
    fd.set('startsAt', new Date(data.startsAt).toISOString());
    fd.set('endsAt', new Date(data.endsAt).toISOString());
    if (data.notes) fd.set('notes', data.notes);
    if (!isEdit && data.recurring) {
      fd.set('recurring', 'on');
      fd.set('repeatEvery', String(data.repeatEvery));
      fd.set('repeatUnit', data.repeatUnit);
      fd.set('occurrences', String(data.occurrences));
    }
    startTransition(() => formAction(fd));
  });

  const recurring = form.watch('recurring');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar agendamento' : 'Novo agendamento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          Nenhum paciente ativo — cadastre um antes
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
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
                    <FormLabel>Local (opcional)</FormLabel>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
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
                          Cria múltiplos agendamentos no mesmo horário, espaçados conforme abaixo.
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
                            <Input
                              type="number"
                              min={1}
                              max={52}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number.parseInt(e.target.value, 10) || 1)
                              }
                            />
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
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormLabel>Quantidade de sessões</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={104}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number.parseInt(e.target.value, 10) || 1)
                              }
                            />
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
              <Button type="submit" disabled={pending || patients.length === 0}>
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar agendamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
