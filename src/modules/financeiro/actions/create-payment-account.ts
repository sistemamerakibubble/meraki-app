'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { paymentAccountSchema } from '@/modules/financeiro/schemas/payment-account';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type PaymentAccountResult = Result<{ id: string }, FormError>;

export async function createPaymentAccountAction(
  _prev: PaymentAccountResult | null,
  formData: FormData,
): Promise<PaymentAccountResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão.' });
  }

  const parsed = parseFormData(paymentAccountSchema, formData);
  if (!parsed.success) return err({ fieldErrors: parsed.error.flatten().fieldErrors });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payment_accounts')
    .insert({
      org_id: session.profile.orgId,
      name: parsed.data.name,
      bank_name: parsed.data.bankName || null,
      account_type: parsed.data.accountType,
      agency: parsed.data.agency || null,
      account_number: parsed.data.accountNumber || null,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar a conta.' });

  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}

export async function updatePaymentAccountAction(
  id: string,
  _prev: PaymentAccountResult | null,
  formData: FormData,
): Promise<PaymentAccountResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão.' });
  }

  const parsed = parseFormData(paymentAccountSchema, formData);
  if (!parsed.success) return err({ fieldErrors: parsed.error.flatten().fieldErrors });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payment_accounts')
    .update({
      name: parsed.data.name,
      bank_name: parsed.data.bankName || null,
      account_type: parsed.data.accountType,
      agency: parsed.data.agency || null,
      account_number: parsed.data.accountNumber || null,
    })
    .eq('id', id)
    .eq('org_id', session.profile.orgId)
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível atualizar a conta.' });

  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}

export async function deletePaymentAccountAction(id: string): Promise<{ ok: boolean }> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) return { ok: false };

  const supabase = await createClient();
  await supabase
    .from('payment_accounts')
    .update({ active: false })
    .eq('id', id)
    .eq('org_id', session.profile.orgId);

  revalidatePath(routes.financeiro);
  return { ok: true };
}
