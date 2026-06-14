'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function deleteAppointmentsBatchAction(
  ids: string[],
): Promise<Result<{ count: number }, string>> {
  if (ids.length === 0) return err('Nenhum agendamento selecionado.');

  await requireUser();
  if (!(await checkPermission('appointments.modify'))) {
    return err('Sem permissão para excluir agendamentos.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('appointments').delete().in('id', ids);

  if (error) return err('Não foi possível excluir os agendamentos.');

  revalidatePath(routes.agenda);
  return ok({ count: ids.length });
}
