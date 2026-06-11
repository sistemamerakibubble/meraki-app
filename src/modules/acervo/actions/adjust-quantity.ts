'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function adjustQuantityAction(
  id: string,
  delta: number,
): Promise<Result<{ quantity: number }, string>> {
  await requireUser();
  if (!(await checkPermission('inventory.modify'))) {
    return err('Sem permissão.');
  }

  if (!Number.isInteger(delta) || delta === 0) {
    return err('Ajuste inválido.');
  }

  const supabase = await createClient();
  const { data: current, error: readErr } = await supabase
    .from('inventory_items')
    .select('quantity')
    .eq('id', id)
    .maybeSingle();

  if (readErr || !current) return err('Item não encontrado.');

  const next = current.quantity + delta;
  if (next < 0) return err('Quantidade não pode ficar negativa.');

  const { error } = await supabase
    .from('inventory_items')
    .update({ quantity: next })
    .eq('id', id);

  if (error) return err('Não foi possível ajustar a quantidade.');

  revalidatePath(routes.acervo);
  return ok({ quantity: next });
}
