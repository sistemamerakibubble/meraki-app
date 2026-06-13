'use client';

import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
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

import { EXPENSE_CATEGORY_PRESET_COLORS, type ExpenseCategory } from '@/types/domain';
import {
  createExpenseCategoryAction,
  updateExpenseCategoryAction,
  type ExpenseCategoryResult,
} from '@/modules/financeiro/actions/expense-category';

type Mode = { kind: 'create' } | { kind: 'edit'; category: ExpenseCategory };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  onSuccess?: () => void;
};

type FormShape = {
  name: string;
  color: string;
  description: string;
};

function defaults(mode: Mode): FormShape {
  if (mode.kind === 'edit') {
    return {
      name: mode.category.name,
      color: mode.category.color,
      description: mode.category.description ?? '',
    };
  }
  return { name: '', color: '#6366f1', description: '' };
}

export function ExpenseCategoryForm({ mode, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = mode.kind === 'edit';

  const form = useForm<FormShape>({ defaultValues: defaults(mode) });
  const selectedColor = form.watch('color');

  useEffect(() => {
    if (open) form.reset(defaults(mode));
  }, [open, mode, form]);

  const action = isEdit
    ? (prev: ExpenseCategoryResult | null, fd: FormData) =>
        updateExpenseCategoryAction(
          (mode as { kind: 'edit'; category: ExpenseCategory }).category.id,
          prev,
          fd,
        )
    : createExpenseCategoryAction;

  const [state, formAction, pending] = useActionState<ExpenseCategoryResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Categoria atualizada.' : 'Categoria criada.');
      setOpen(false);
      onSuccess?.();
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('name', data.name);
    fd.set('color', data.color);
    fd.set('description', data.description);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar categoria' : 'Nova categoria de despesa'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Aluguel, Salário, Material..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Detalhes sobre esta categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor de identificação</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {EXPENSE_CATEGORY_PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => field.onChange(c)}
                        className="h-7 w-7 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: selectedColor === c ? '#000' : 'transparent',
                          transform: selectedColor === c ? 'scale(1.15)' : 'scale(1)',
                        }}
                        aria-label={`Cor ${c}`}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-1">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded border border-input p-0"
                        title="Cor personalizada"
                      />
                      <span className="text-xs text-muted-foreground">Personalizada</span>
                    </div>
                  </div>
                  <div
                    className="mt-2 flex items-center gap-2 rounded-md border px-3 py-2"
                    style={{ borderLeftColor: selectedColor, borderLeftWidth: 4 }}
                  >
                    <span className="text-sm font-medium">
                      {form.watch('name') || 'Prévia da categoria'}
                    </span>
                  </div>
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
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
