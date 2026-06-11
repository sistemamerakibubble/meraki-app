'use client';

import { startTransition, useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  clinicalNoteSchema,
  type ClinicalNoteInput,
} from '@/modules/pacientes/schemas/clinical-note';
import {
  addClinicalNoteAction,
  type AddClinicalNoteResult,
} from '@/modules/pacientes/actions/add-clinical-note';

export function ClinicalNoteForm({
  patientId,
  canWrite,
}: {
  patientId: string;
  canWrite: boolean;
}) {
  const form = useForm<ClinicalNoteInput>({
    resolver: zodResolver(clinicalNoteSchema),
    defaultValues: { patientId, content: '' },
  });

  const [state, formAction, pending] = useActionState<AddClinicalNoteResult | null, FormData>(
    addClinicalNoteAction,
    null,
  );

  const lastSuccessId = useRef<string | null>(null);
  useEffect(() => {
    if (state?.ok && state.data.id !== lastSuccessId.current) {
      lastSuccessId.current = state.data.id;
      toast.success('Anotação registrada.');
      form.reset({ patientId, content: '' });
    }
  }, [state, form, patientId]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('patientId', data.patientId);
    fd.set('content', data.content);
    startTransition(() => formAction(fd));
  });

  if (!canWrite) {
    return (
      <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
        Apenas médicos e administradores podem adicionar anotações clínicas.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova anotação clínica</FormLabel>
              <FormControl>
                <textarea
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descreva o atendimento, evolução ou observações clínicas..."
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

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? 'Salvando...' : 'Registrar anotação'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
