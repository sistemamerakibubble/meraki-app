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
  evolutionSchema,
  type EvolutionInput,
} from '@/modules/pacientes/schemas/evolution';
import {
  createEvolutionAction,
  updateEvolutionAction,
  type CreateEvolutionResult,
  type UpdateEvolutionResult,
} from '@/modules/pacientes/actions/evolution';
import type { PatientEvolution } from '@/types/domain';

type Mode =
  | { kind: 'create'; patientId: string }
  | { kind: 'edit'; evolution: PatientEvolution };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function defaults(mode: Mode): EvolutionInput {
  if (mode.kind === 'edit') {
    return {
      patientId: mode.evolution.patientId,
      title: mode.evolution.title,
      summary: mode.evolution.summary,
      content: mode.evolution.content,
    };
  }
  return { patientId: mode.patientId, title: '', summary: '', content: '' };
}

export function EvolutionForm({
  mode,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const form = useForm<EvolutionInput>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: defaults(mode),
  });

  useEffect(() => {
    if (open) form.reset(defaults(mode));
  }, [open, mode, form]);

  const isEdit = mode.kind === 'edit';
  const action = isEdit
    ? (prev: UpdateEvolutionResult | null, fd: FormData) =>
        updateEvolutionAction(mode.evolution.id, prev, fd)
    : createEvolutionAction;

  type Combined = CreateEvolutionResult | UpdateEvolutionResult;
  const [state, formAction, pending] = useActionState<Combined | null, FormData>(action, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Evolução atualizada.' : 'Evolução registrada.');
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isEdit]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('patientId', data.patientId);
    fd.set('title', data.title);
    fd.set('summary', data.summary);
    fd.set('content', data.content);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar evolução' : 'Nova evolução periódica'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Evolução semanal · 18ª sessão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumo clínico (até 500 caracteres)</FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      maxLength={500}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Linha geral exibida na lista de evoluções."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evolução completa</FormLabel>
                  <FormControl>
                    <textarea
                      rows={8}
                      className="flex min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Descreva o conteúdo completo da evolução periódica..."
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
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Registrar evolução'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
