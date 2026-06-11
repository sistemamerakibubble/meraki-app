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

  const supabase = await createClient();
  const { error } = await supabase
    .from('billings')
    .update({
      patient_id: parsed.data.patientId,
      type: parsed.data.type,
      description: parsed.data.description,
      amount_cents: parsed.data.amountCents,
      due_date: parsed.data.dueDate,
      payment_method: parsed.data.paymentMethod || null,
    })
    .eq('id', id);

  if (error) return err({ formError: 'Não foi possível salvar as alterações.' });

  revalidatePath(routes.financeiro);
  return ok({ id });
}
