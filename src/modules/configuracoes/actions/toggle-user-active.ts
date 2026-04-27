'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function toggleUserActiveAction(
  id: string,
  nextActive: boolean,
): Promise<Result<null, string>> {
  const session = await requireRole('admin');

  if (id === session.id && !nextActive) {
    return err('Você não pode desativar a si mesmo.');
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return err('Service role não configurada.');
  }

  const { data: target } = await admin
    .from('profiles')
    .select('role, org_id, active')
    .eq('id', id)
    .maybeSingle();

  if (!target) return err('Usuário não encontrado.');
  if (target.org_id !== session.profile.orgId) return err('Usuário de outra organização.');

  if (target.role === 'admin' && !nextActive) {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', session.profile.orgId)
      .eq('role', 'admin')
      .eq('active', true);
    if ((count ?? 0) <= 1) {
      return err('Não é possível desativar o único admin ativo.');
    }
  }

  const { error } = await admin
    .from('profiles')
    .update({ active: nextActive })
    .eq('id', id);

  if (error) return err('Não foi possível atualizar o status.');

  revalidatePath(routes.configuracoes);
  return ok(null);
}
