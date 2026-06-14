'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function deleteAppointmentAction(id: string): Promise<Result<null, string>> {
  await requireUser();
  if (!(await checkPermission('appointments.modify'))) {
    return err('Sem permissão para excluir agendamentos.');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('appointments').delete().eq('id', id);

  if (error) return err('Não foi possível excluir o agendamento.');

  revalidatePath(routes.agenda);
  return ok(null);
}
