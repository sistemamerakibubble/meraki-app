'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
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

  // Regras de transição:
  // - concluida: só supervisor ou admin
  // - em_revisao: só supervisor ou admin
  // - cancelada: solicitante ou admin
  // - pendente: reabertura pelo supervisor ou admin
  if (parsed.data === 'concluida' || parsed.data === 'em_revisao') {
    if (!isSupervisor && !isAdmin) return err('Apenas o supervisor pode alterar para este status.');
  } else if (parsed.data === 'cancelada') {
    if (!isProfessional && !isAdmin) return err('Apenas o solicitante pode cancelar.');
  } else if (parsed.data === 'pendente') {
    if (!isSupervisor && !isAdmin) return err('Apenas o supervisor pode reabrir.');
  }

  const { error } = await supabase
    .from('supervisions')
    .update({ status: parsed.data })
    .eq('id', id);

  if (error) return err('Não foi possível atualizar o status.');

  revalidatePath(routes.supervisao);
  return ok(null);
}
