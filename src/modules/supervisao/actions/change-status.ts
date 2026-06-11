'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { supervisionStatusSchema } from '@/modules/supervisao/schemas/supervision';
import { routes } from '@/lib/constants/routes';
import type { SupervisionStatus } from '@/types/domain';

export async function changeSupervisionStatusAction(
  id: string,
  next: SupervisionStatus,
): Promise<Result<null, string>> {
  const session = await requireUser();

  const parsed = supervisionStatusSchema.safeParse(next);
  if (!parsed.success) return err('Status inválido.');

  const supabase = await createClient();
  const { data: current, error: readErr } = await supabase
    .from('supervisions')
    .select('professional_id, supervisor_id, status')
    .eq('id', id)
    .maybeSingle();

  if (readErr || !current) return err('Supervisão não encontrada.');

  const isProfessional = current.professional_id === session.id;
  const isSupervisor = current.supervisor_id === session.id;
  const isAdmin = session.profile.role === 'admin';
  const canReview = await checkPermission('supervisions.review');

  if (parsed.data === 'concluida' || parsed.data === 'em_revisao') {
    if (!isAdmin && !(isSupervisor && canReview)) {
      return err('Apenas o supervisor designado pode alterar para este status.');
    }
  } else if (parsed.data === 'cancelada') {
    if (!isProfessional && !isAdmin) return err('Apenas o solicitante pode cancelar.');
  } else if (parsed.data === 'pendente') {
    if (!isAdmin && !(isSupervisor && canReview)) {
      return err('Apenas o supervisor pode reabrir.');
    }
  }

  const { error } = await supabase
    .from('supervisions')
    .update({ status: parsed.data })
    .eq('id', id);

  if (error) return err('Não foi possível atualizar o status.');

  revalidatePath(routes.supervisao);
  return ok(null);
}
