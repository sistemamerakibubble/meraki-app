'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function deleteBillingAction(id: string): Promise<Result<null, string>> {
  const session = await requireUser();
  if (session.profile.role !== 'admin') {
    return err('Apenas admin pode excluir lançamentos.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('billings').delete().eq('id', id);
  if (error) return err('Não foi possível excluir o lançamento.');

  revalidatePath(routes.financeiro);
  return ok(null);
}
