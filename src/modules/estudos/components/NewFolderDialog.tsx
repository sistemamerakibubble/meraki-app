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

import { folderSchema, type FolderInput } from '@/modules/estudos/schemas/folder';
import {
  createFolderAction,
  type CreateFolderResult,
} from '@/modules/estudos/actions/create-folder';

export function NewFolderDialog({
  parentId,
  trigger,
}: {
  parentId?: string | null;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<FolderInput>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: '', parentId: parentId ?? '' },
  });

  const [state, formAction, pending] = useActionState<CreateFolderResult | null, FormData>(
    createFolderAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success('Pasta criada.');
      setOpen(false);
      form.reset({ name: '', parentId: parentId ?? '' });
    }
  }, [state, form, parentId]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('name', data.name);
    if (data.parentId) fd.set('parentId', data.parentId);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova pasta</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da pasta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Livros, Artigos, Protocolos..." {...field} />
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
                {pending ? 'Criando...' : 'Criar pasta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
