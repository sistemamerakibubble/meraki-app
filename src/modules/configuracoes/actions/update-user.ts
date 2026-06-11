'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { updateUserSchema } from '@/modules/configuracoes/schemas/update-user';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type UpdateUserResult = Result<{ id: string }, FormError>;

async function countActiveAdmins(
  admin: ReturnType<typeof createAdminClient>,
  orgId: string,
): Promise<number> {
  const { count } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('role', 'admin')
    .eq('active', true);
  return count ?? 0;
}

export async function updateUserAction(
  id: string,
  _prev: UpdateUserResult | null,
  formData: FormData,
): Promise<UpdateUserResult> {
  const session = await requireRole('admin');

  const parsed = parseFormData(updateUserSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return err({ formError: 'Service role não configurada.' });
  }

  const { data: target } = await admin
    .from('profiles')
    .select('role, org_id, active')
    .eq('id', id)
    .maybeSingle();

  if (!target) return err({ formError: 'Usuário não encontrado.' });
  if (target.org_id !== session.profile.orgId) {
    return err({ formError: 'Usuário de outra organização.' });
  }

  if (
    target.role === 'admin' &&
    parsed.data.role !== 'admin' &&
    target.active
  ) {
    const admins = await countActiveAdmins(admin, session.profile.orgId);
    if (admins <= 1) {
      return err({ formError: 'Não é possível rebaixar o único admin ativo.' });
    }
  }

  const { error } = await admin
    .from('profiles')
    .update({ full_name: parsed.data.fullName, role: parsed.data.role })
    .eq('id', id);

  if (error) return err({ formError: 'Não foi possível salvar.' });

  revalidatePath(routes.configuracoes);
  return ok({ id });
}
