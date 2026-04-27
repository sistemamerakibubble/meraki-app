'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { billingSchema } from '@/modules/financeiro/schemas/billing';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreateBillingResult = Result<{ id: string }, FormError>;

export async function createBillingAction(
  _prev: CreateBillingResult | null,
  formData: FormData,
): Promise<CreateBillingResult> {
  const session = await requireUser();

  if (session.profile.role !== 'admin' && session.profile.role !== 'recepcao') {
    return err({ formError: 'Apenas admin e recepção podem criar lançamentos.' });
  }

  const parsed = parseFormData(billingSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('billings')
    .insert({
      org_id: session.profile.orgId,
      patient_id: parsed.data.patientId,
      type: parsed.data.type,
      description: parsed.data.description,
      amount_cents: parsed.data.amountCents,
      due_date: parsed.data.dueDate,
      payment_method: parsed.data.paymentMethod || null,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar o lançamento.' });

  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}
