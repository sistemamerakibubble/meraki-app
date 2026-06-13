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
export type UpdateBillingResult = Result<{ id: string }, FormError>;

export async function updateBillingAction(
  id: string,
  _prev: UpdateBillingResult | null,
  formData: FormData,
): Promise<UpdateBillingResult> {
  await requireUser();

  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão para editar lançamentos.' });
  }

  const parsed = parseFormData(billingSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from('billings')
    .update({
      patient_id: d.patientId,
      type: d.type,
      description: d.description,
      amount_cents: d.amountCents,
      due_date: d.dueDate,
      payment_method: d.paymentMethod || null,
      payment_method_type: d.paymentMethodType || null,
      payment_account_id: d.paymentAccountId,
      credit_card_id: d.creditCardId,
      expense_category_id: d.type === 'despesa' ? d.expenseCategoryId : null,
      notes: d.notes || null,
    })
    .eq('id', id);

  if (error) return err({ formError: 'Não foi possível salvar as alterações.' });

  revalidatePath(routes.financeiro);
  return ok({ id });
}
