'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { appointmentStatusSchema } from '@/modules/agenda/schemas/appointment';
import { routes } from '@/lib/constants/routes';
import type { AppointmentStatus } from '@/types/domain';

export async function changeAppointmentStatusAction(
  id: string,
  nextStatus: AppointmentStatus,
): Promise<Result<null, string>> {
  await requireUser();
  if (!(await checkPermission('appointments.modify'))) {
    return err('Sem permissão para alterar agendamentos.');
  }

  const parsed = appointmentStatusSchema.safeParse(nextStatus);
  if (!parsed.success) return err('Status inválido.');

  const supabase = await createClient();
  const { error } = await supabase
    .from('appointments')
    .update({
      status: parsed.data,
      confirmed: parsed.data === 'confirmado',
    })
    .eq('id', id);

  if (error) return err('Não foi possível atualizar o status.');

  revalidatePath(routes.agenda);
  return ok(null);
}
