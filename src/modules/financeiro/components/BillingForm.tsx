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

import { billingSchema, type BillingInput } from '@/modules/financeiro/schemas/billing';
import {
  createBillingAction,
  type CreateBillingResult,
} from '@/modules/financeiro/actions/create-billing';
import {
  updateBillingAction,
  type UpdateBillingResult,
} from '@/modules/financeiro/actions/update-billing';
import { brlToCents, formatBRL } from '@/lib/utils/money';
import type { Billing } from '@/types/domain';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; billing: Billing };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  patients: { id: string; fullName: string }[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (id: string) => void;
};

type FormShape = {
  type: BillingInput['type'];
  description: string;
  amountDisplay: string;
  dueDate: string;
  patientId: string;
  paymentMethod: string;
};

function defaultValues(mode: Mode): FormShape {
  if (mode.kind === 'edit') {
    return {
      type: mode.billing.type,
      description: mode.billing.description,
      amountDisplay: formatBRL(mode.billing.amountCents),
      dueDate: mode.billing.dueDate,
      patientId: mode.billing.patientId ?? '',
      paymentMethod: mode.billing.paymentMethod ?? '',
    };
  }
  return {
    type: 'receita',
    description: '',
    amountDisplay: '',
    dueDate: new Date().toISOString().slice(0, 10),
    patientId: '',
    paymentMethod: '',
  };
}

export function BillingForm({
  mode,
  trigger,
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

  const form = useForm<FormShape>({
    defaultValues: defaultValues(mode),
    resolver: async (values) => {
      const parsed = billingSchema.safeParse({
        type: values.type,
        description: values.description,
        amountCents: safeBrlToCents(values.amountDisplay),
        dueDate: values.dueDate,
        patientId: values.patientId,
        paymentMethod: values.paymentMethod,
      });
      if (parsed.success) return { values, errors: {} };
      return {
        values: {},
        errors: Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, msgs]) => {
            const key = k === 'amountCents' ? 'amountDisplay' : k;
            return [key, { message: msgs?.[0] ?? 'Inválido', type: 'validate' }];
          }),
        ),
      };
    },
  });

  useEffect(() => {
    if (open) form.reset(defaultValues(mode));
  }, [open, mode, form]);

  const isEdit = mode.kind === 'edit';
  const action = isEdit
    ? (prev: UpdateBillingResult | null, fd: FormData) =>
        updateBillingAction(mode.billing.id, prev, fd)
    : createBillingAction;

  type Combined = CreateBillingResult | UpdateBillingResult;
  const [state, formAction, pending] = useActionState<Combined | null, FormData>(action, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Lançamento atualizado.' : 'Lançamento criado.');
      setOpen(false);
      onSuccess?.(state.data.id);
    }
  }, [state, isEdit, onSuccess]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('type', data.type);
    fd.set('description', data.description);
    fd.set('amountCents', String(safeBrlToCents(data.amountDisplay)));
    fd.set('dueDate', data.dueDate);
    if (data.patientId) fd.set('patientId', data.patientId);
    if (data.paymentMethod) fd.set('paymentMethod', data.paymentMethod);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as BillingInput['type'])}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountDisplay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Consulta particular, Aluguel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Pix, Dinheiro, Cartão..." {...field} />
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
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function safeBrlToCents(input: string): number {
  if (!input) return 0;
  try {
    return brlToCents(input);
  } catch {
    return 0;
  }
}
