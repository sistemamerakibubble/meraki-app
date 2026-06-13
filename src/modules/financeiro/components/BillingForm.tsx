'use client';

import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import {
  PAYMENT_METHOD_TYPE_LABELS,
  type Billing,
  type CreditCard,
  type ExpenseCategory,
  type PaymentAccount,
} from '@/types/domain';

type Mode = { kind: 'create' } | { kind: 'edit'; billing: Billing };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  patients: { id: string; fullName: string }[];
  accounts: PaymentAccount[];
  cards: CreditCard[];
  categories: ExpenseCategory[];
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
  paymentMethodType: string;
  paymentAccountId: string;
  creditCardId: string;
  recurrenceType: 'avulso' | 'recorrente' | 'parcelado';
  installmentCount: string;
  expenseCategoryId: string;
  notes: string;
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
      paymentMethodType: mode.billing.paymentMethodType ?? '',
      paymentAccountId: mode.billing.paymentAccountId ?? '',
      creditCardId: mode.billing.creditCardId ?? '',
      recurrenceType: mode.billing.recurrenceType ?? 'avulso',
      installmentCount: mode.billing.installmentCount ? String(mode.billing.installmentCount) : '',
      expenseCategoryId: mode.billing.expenseCategoryId ?? '',
      notes: mode.billing.notes ?? '',
    };
  }
  return {
    type: 'receita',
    description: '',
    amountDisplay: '',
    dueDate: new Date().toISOString().slice(0, 10),
    patientId: '',
    paymentMethod: '',
    paymentMethodType: '',
    paymentAccountId: '',
    creditCardId: '',
    recurrenceType: 'avulso',
    installmentCount: '',
    expenseCategoryId: '',
    notes: '',
  };
}

export function BillingForm({
  mode,
  trigger,
  patients,
  accounts,
  cards,
  categories,
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
        paymentMethodType: values.paymentMethodType,
        paymentAccountId: values.paymentAccountId,
        creditCardId: values.creditCardId,
        recurrenceType: values.recurrenceType,
        installmentCount: values.installmentCount,
        expenseCategoryId: values.expenseCategoryId,
        notes: values.notes,
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

  const billingType = useWatch({ control: form.control, name: 'type' });
  const paymentMethodType = useWatch({ control: form.control, name: 'paymentMethodType' });
  const recurrenceType = useWatch({ control: form.control, name: 'recurrenceType' });

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('type', data.type);
    fd.set('description', data.description);
    fd.set('amountCents', String(safeBrlToCents(data.amountDisplay)));
    fd.set('dueDate', data.dueDate);
    if (data.patientId) fd.set('patientId', data.patientId);
    if (data.paymentMethod) fd.set('paymentMethod', data.paymentMethod);
    if (data.paymentMethodType) fd.set('paymentMethodType', data.paymentMethodType);
    if (data.paymentAccountId) fd.set('paymentAccountId', data.paymentAccountId);
    if (data.creditCardId) fd.set('creditCardId', data.creditCardId);
    fd.set('recurrenceType', data.recurrenceType);
    if (data.installmentCount) fd.set('installmentCount', data.installmentCount);
    if (data.expenseCategoryId) fd.set('expenseCategoryId', data.expenseCategoryId);
    if (data.notes) fd.set('notes', data.notes);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {/* Tipo + Valor */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v as BillingInput['type']);
                        if (v === 'receita') form.setValue('expenseCategoryId', '');
                      }}
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

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Aluguel sala, Sessão particular..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria (só para despesas) */}
            {billingType === 'despesa' && categories.length > 0 ? (
              <FormField
                control={form.control}
                name="expenseCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar categoria..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sem categoria</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Vencimento + Paciente */}
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

            {/* Recorrência (só na criação) */}
            {!isEdit ? (
              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de lançamento</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="avulso">Avulso</SelectItem>
                        <SelectItem value="recorrente">Recorrente (mensal)</SelectItem>
                        <SelectItem value="parcelado">Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Parcelas */}
            {recurrenceType === 'parcelado' && !isEdit ? (
              <FormField
                control={form.control}
                name="installmentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de parcelas</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="Ex.: 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Forma de pagamento */}
            <FormField
              control={form.control}
              name="paymentMethodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento (opcional)</FormLabel>
                  <Select
                    value={field.value || '__none__'}
                    onValueChange={(v) => {
                      field.onChange(v === '__none__' ? '' : v);
                      form.setValue('paymentAccountId', '');
                      form.setValue('creditCardId', '');
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Não informar</SelectItem>
                      {Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([k, label]) => (
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

            {/* Conta bancária */}
            {paymentMethodType === 'debito_conta' && accounts.length > 0 ? (
              <FormField
                control={form.control}
                name="paymentAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta bancária</FormLabel>
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar conta..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Selecionar...</SelectItem>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Cartão */}
            {paymentMethodType === 'cartao_credito' && cards.length > 0 ? (
              <FormField
                control={form.control}
                name="creditCardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão de crédito</FormLabel>
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar cartão..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Selecionar...</SelectItem>
                        {cards.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            {c.lastFour ? ` •••• ${c.lastFour}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Notas internas sobre este lançamento..." {...field} />
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
