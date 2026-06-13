'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { creditCardSchema } from '@/modules/financeiro/schemas/credit-card';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreditCardResult = Result<{ id: string }, FormError>;

export async function createCreditCardAction(
  _prev: CreditCardResult | null,
  formData: FormData,
): Promise<CreditCardResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão.' });
  }

  const parsed = parseFormData(creditCardSchema, formData);
  if (!parsed.success) return err({ fieldErrors: parsed.error.flatten().fieldErrors });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('credit_cards')
    .insert({
      org_id: session.profile.orgId,
      name: parsed.data.name,
      brand: parsed.data.brand || null,
      last_four: parsed.data.lastFour || null,
      closing_day: parsed.data.closingDay,
      due_day: parsed.data.dueDay,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar o cartão.' });

  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}

export async function updateCreditCardAction(
  id: string,
  _prev: CreditCardResult | null,
  formData: FormData,
): Promise<CreditCardResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão.' });
  }

  const parsed = parseFormData(creditCardSchema, formData);
  if (!parsed.success) return err({ fieldErrors: parsed.error.flatten().fieldErrors });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('credit_cards')
    .update({
      name: parsed.data.name,
      brand: parsed.data.brand || null,
      last_four: parsed.data.lastFour || null,
      closing_day: parsed.data.closingDay,
      due_day: parsed.data.dueDay,
    })
    .eq('id', id)
    .eq('org_id', session.profile.orgId)
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível atualizar o cartão.' });

  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}

export async function deleteCreditCardAction(id: string): Promise<{ ok: boolean }> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) return { ok: false };

  const supabase = await createClient();
  await supabase
    .from('credit_cards')
    .update({ active: false })
    .eq('id', id)
    .eq('org_id', session.profile.orgId);

  revalidatePath(routes.financeiro);
  return { ok: true };
}
