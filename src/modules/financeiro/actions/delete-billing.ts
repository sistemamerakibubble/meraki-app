'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function deleteBillingAction(id: string): Promise<Result<null, string>> {
  await requireUser();
  if (!(await checkPermission('financials.delete'))) {
    return err('Sem permissão para excluir lançamentos.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('billings').delete().eq('id', id);
  if (error) return err('Não foi possível excluir o lançamento.');

  revalidatePath(routes.financeiro);
  return ok(null);
}
