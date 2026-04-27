'use client';

import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import { patientSchema, type PatientInput } from '@/modules/pacientes/schemas/patient';
import {
  createPatientAction,
  type CreatePatientResult,
} from '@/modules/pacientes/actions/create-patient';
import {
  updatePatientAction,
  type UpdatePatientResult,
} from '@/modules/pacientes/actions/update-patient';
import type { Patient } from '@/types/domain';
import { formatPhone } from '@/lib/utils/phone';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; patient: Patient };

type Props = {
  mode: Mode;
  trigger: ReactNode;
  onSuccess?: (id: string) => void;
};

function defaultValuesFor(mode: Mode): PatientInput {
  if (mode.kind === 'edit') {
    return {
      fullName: mode.patient.fullName,
      birthdate: mode.patient.birthdate ?? '',
      phone: mode.patient.phone ? formatPhone(mode.patient.phone) : '',
      email: mode.patient.email ?? '',
      document: mode.patient.document ?? '',
      notes: mode.patient.notes ?? '',
    };
  }
  return { fullName: '', birthdate: '', phone: '', email: '', document: '', notes: '' };
}

export function PatientForm({ mode, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValuesFor(mode),
  });

  useEffect(() => {
    if (open) form.reset(defaultValuesFor(mode));
  }, [open, mode, form]);

  const isEdit = mode.kind === 'edit';
  const action = isEdit
    ? (prev: UpdatePatientResult | null, fd: FormData) =>
        updatePatientAction(mode.patient.id, prev, fd)
    : createPatientAction;

  type CombinedResult = CreatePatientResult | UpdatePatientResult;
  const [state, formAction, pending] = useActionState<CombinedResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Paciente atualizado.' : 'Paciente criado.');
      setOpen(false);
      onSuccess?.(state.data.id);
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('fullName', data.fullName);
    if (data.birthdate) fd.set('birthdate', data.birthdate);
    if (data.phone) fd.set('phone', data.phone);
    if (data.email) fd.set('email', data.email);
    if (data.document) fd.set('document', data.document);
    if (data.notes) fd.set('notes', data.notes);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar paciente' : 'Novo paciente'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="Ex.: Maria da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF (opcional)</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
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
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar paciente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
