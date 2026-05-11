'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function archivePatientAction(id: string): Promise<Result<null, string>> {
  await requireUser();
  if (!(await checkPermission('patients.archive'))) {
    return err('Sem permissão para arquivar pacientes.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('patients')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) return err('Não foi possível arquivar o paciente.');

  revalidatePath(routes.pacientes);
  revalidatePath(routes.patient(id));
  return ok(null);
}

export async function togglePatientActiveAction(
  id: string,
  next: boolean,
): Promise<Result<null, string>> {
  await requireUser();
  if (!(await checkPermission('patients.update'))) {
    return err('Sem permissão para alterar o paciente.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('patients')
    .update({ active: next })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) return err('Não foi possível atualizar o status do paciente.');

  revalidatePath(routes.pacientes);
  revalidatePath(routes.patient(id));
  return ok(null);
}
