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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ACCOUNT_TYPE_LABELS, type PaymentAccount } from '@/types/domain';
import {
  createPaymentAccountAction,
  updatePaymentAccountAction,
  type PaymentAccountResult,
} from '@/modules/financeiro/actions/create-payment-account';

type Mode = { kind: 'create' } | { kind: 'edit'; account: PaymentAccount };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  onSuccess?: () => void;
};

type FormShape = {
  name: string;
  bankName: string;
  accountType: 'corrente' | 'poupanca' | 'pagamento';
  agency: string;
  accountNumber: string;
};

function defaults(mode: Mode): FormShape {
  if (mode.kind === 'edit') {
    return {
      name: mode.account.name,
      bankName: mode.account.bankName ?? '',
      accountType: mode.account.accountType,
      agency: mode.account.agency ?? '',
      accountNumber: mode.account.accountNumber ?? '',
    };
  }
  return { name: '', bankName: '', accountType: 'corrente', agency: '', accountNumber: '' };
}

export function PaymentAccountForm({ mode, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = mode.kind === 'edit';

  const form = useForm<FormShape>({ defaultValues: defaults(mode) });

  useEffect(() => {
    if (open) form.reset(defaults(mode));
  }, [open, mode, form]);

  const action = isEdit
    ? (prev: PaymentAccountResult | null, fd: FormData) =>
        updatePaymentAccountAction((mode as { kind: 'edit'; account: PaymentAccount }).account.id, prev, fd)
    : createPaymentAccountAction;

  const [state, formAction, pending] = useActionState<PaymentAccountResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Conta atualizada.' : 'Conta cadastrada.');
      setOpen(false);
      onSuccess?.();
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('name', data.name);
    fd.set('bankName', data.bankName);
    fd.set('accountType', data.accountType);
    fd.set('agency', data.agency);
    fd.set('accountNumber', data.accountNumber);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar conta bancária' : 'Nova conta bancária'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da conta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Nubank PJ, Bradesco Corrente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, label]) => (
                          <SelectItem key={k} value={k}>
                            {label}
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
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Nubank, Bradesco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="agency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da conta (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="12345-6" {...field} />
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
