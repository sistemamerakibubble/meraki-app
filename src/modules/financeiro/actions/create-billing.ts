'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { billingSchema } from '@/modules/financeiro/schemas/billing';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreateBillingResult = Result<{ id: string }, FormError>;

function addMonths(dateStr: string, months: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export async function createBillingAction(
  _prev: CreateBillingResult | null,
  formData: FormData,
): Promise<CreateBillingResult> {
  const session = await requireUser();

  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão para criar lançamentos.' });
  }

  const parsed = parseFormData(billingSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const {
    type,
    description,
    amountCents,
    dueDate,
    patientId,
    paymentMethod,
    billingCategory,
    paymentMethodType,
    paymentAccountId,
    creditCardId,
    recurrenceType,
    installmentCount,
    expenseCategoryId,
    notes,
  } = parsed.data;

  const supabase = await createClient();

  const baseRow = {
    org_id: session.profile.orgId,
    patient_id: patientId,
    type,
    billing_category: billingCategory || null,
    description,
    payment_method: paymentMethod || null,
    payment_method_type: paymentMethodType || null,
    payment_account_id: paymentAccountId,
    credit_card_id: creditCardId,
    recurrence_type: recurrenceType,
    expense_category_id: type === 'despesa' ? expenseCategoryId : null,
    notes: notes || null,
  };

  if (recurrenceType === 'parcelado' && installmentCount && installmentCount >= 2) {
    const groupId = crypto.randomUUID();
    const installmentAmountCents = Math.round(amountCents / installmentCount);

    const rows = Array.from({ length: installmentCount }, (_, i) => ({
      ...baseRow,
      amount_cents: installmentAmountCents,
      due_date: addMonths(dueDate, i),
      recurrence_group_id: groupId,
      installment_number: i + 1,
      installment_count: installmentCount,
      description: `${description} (${i + 1}/${installmentCount})`,
    }));

    const { data, error } = await supabase.from('billings').insert(rows).select('id');
    if (error || !data?.[0]) return err({ formError: 'Não foi possível criar as parcelas.' });

    revalidatePath(routes.financeiro);
    return ok({ id: data[0].id });
  }

  const { data, error } = await supabase
    .from('billings')
    .insert({
      ...baseRow,
      amount_cents: amountCents,
      due_date: dueDate,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar o lançamento.' });

  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}
