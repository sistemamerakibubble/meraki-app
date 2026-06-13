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

import type { CreditCard } from '@/types/domain';
import {
  createCreditCardAction,
  updateCreditCardAction,
  type CreditCardResult,
} from '@/modules/financeiro/actions/create-credit-card';

type Mode = { kind: 'create' } | { kind: 'edit'; card: CreditCard };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  onSuccess?: () => void;
};

type FormShape = {
  name: string;
  brand: string;
  lastFour: string;
  closingDay: string;
  dueDay: string;
};

function defaults(mode: Mode): FormShape {
  if (mode.kind === 'edit') {
    return {
      name: mode.card.name,
      brand: mode.card.brand ?? '',
      lastFour: mode.card.lastFour ?? '',
      closingDay: mode.card.closingDay ? String(mode.card.closingDay) : '',
      dueDay: mode.card.dueDay ? String(mode.card.dueDay) : '',
    };
  }
  return { name: '', brand: '', lastFour: '', closingDay: '', dueDay: '' };
}

export function CreditCardForm({ mode, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = mode.kind === 'edit';

  const form = useForm<FormShape>({ defaultValues: defaults(mode) });

  useEffect(() => {
    if (open) form.reset(defaults(mode));
  }, [open, mode, form]);

  const action = isEdit
    ? (prev: CreditCardResult | null, fd: FormData) =>
        updateCreditCardAction((mode as { kind: 'edit'; card: CreditCard }).card.id, prev, fd)
    : createCreditCardAction;

  const [state, formAction, pending] = useActionState<CreditCardResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Cartão atualizado.' : 'Cartão cadastrado.');
      setOpen(false);
      onSuccess?.();
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('name', data.name);
    fd.set('brand', data.brand);
    fd.set('lastFour', data.lastFour);
    fd.set('closingDay', data.closingDay);
    fd.set('dueDay', data.dueDay);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar cartão' : 'Novo cartão de crédito'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do cartão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Nubank Roxinho, Inter PJ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bandeira (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Visa, Mastercard, Elo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastFour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Últimos 4 dígitos (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="1234"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="closingDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de fechamento (opcional)</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="Ex.: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de vencimento (opcional)</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="Ex.: 20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
