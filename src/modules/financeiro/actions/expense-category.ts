'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { expenseCategorySchema } from '@/modules/financeiro/schemas/expense-category';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type ExpenseCategoryResult = Result<{ id: string }, FormError>;

export async function createExpenseCategoryAction(
  _prev: ExpenseCategoryResult | null,
  formData: FormData,
): Promise<ExpenseCategoryResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão.' });
  }
  const parsed = parseFormData(expenseCategorySchema, formData);
  if (!parsed.success) return err({ fieldErrors: parsed.error.flatten().fieldErrors });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      org_id: session.profile.orgId,
      name: parsed.data.name,
      color: parsed.data.color,
      description: parsed.data.description || null,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar a categoria.' });
  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}

export async function updateExpenseCategoryAction(
  id: string,
  _prev: ExpenseCategoryResult | null,
  formData: FormData,
): Promise<ExpenseCategoryResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão.' });
  }
  const parsed = parseFormData(expenseCategorySchema, formData);
  if (!parsed.success) return err({ fieldErrors: parsed.error.flatten().fieldErrors });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expense_categories')
    .update({
      name: parsed.data.name,
      color: parsed.data.color,
      description: parsed.data.description || null,
    })
    .eq('id', id)
    .eq('org_id', session.profile.orgId)
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível atualizar a categoria.' });
  revalidatePath(routes.financeiro);
  return ok({ id: data.id });
}

export async function deleteExpenseCategoryAction(id: string): Promise<{ ok: boolean }> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) return { ok: false };

  const supabase = await createClient();
  await supabase
    .from('expense_categories')
    .update({ active: false })
    .eq('id', id)
    .eq('org_id', session.profile.orgId);

  revalidatePath(routes.financeiro);
  return { ok: true };
}
