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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  supervisionSchema,
  type SupervisionInput,
} from '@/modules/supervisao/schemas/supervision';
import {
  createSupervisionAction,
  type CreateSupervisionResult,
} from '@/modules/supervisao/actions/create-supervision';
import type { TeamMember } from '@/modules/supervisao/queries/listTeamForSupervision';

export function SupervisionForm({
  supervisors,
  patients,
  trigger,
}: {
  supervisors: TeamMember[];
  patients: { id: string; fullName: string }[];
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<SupervisionInput>({
    resolver: zodResolver(supervisionSchema),
    defaultValues: { title: '', supervisorId: '', patientId: '' },
  });

  const [state, formAction, pending] = useActionState<
    CreateSupervisionResult | null,
    FormData
  >(createSupervisionAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success('Supervisão criada.');
      setOpen(false);
      form.reset({ title: '', supervisorId: '', patientId: '' });
    }
  }, [state, form]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('title', data.title);
    fd.set('supervisorId', data.supervisorId);
    if (data.patientId) fd.set('patientId', data.patientId);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova supervisão</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título / caso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Conduta em ansiedade generalizada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisors.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          Nenhum supervisor disponível
                        </SelectItem>
                      ) : (
                        supervisors.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.fullName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente (opcional)</FormLabel>
                  <Select
                    value={field.value && field.value.length > 0 ? field.value : '__none__'}
                    onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhum" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum</SelectItem>
                      {patients.map((p) => (
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

            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending || supervisors.length === 0}>
                {pending ? 'Criando...' : 'Criar supervisão'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
