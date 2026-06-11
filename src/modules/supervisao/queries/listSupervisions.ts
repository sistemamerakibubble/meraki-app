import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbSupervision } from '@/lib/supabase/helpers';
import type { Supervision, SupervisionStatus } from '@/types/domain';

export type ListSupervisionsArgs = {
  status?: SupervisionStatus;
  professionalId?: string;
  supervisorId?: string;
};

export async function listSupervisions({
  status,
  professionalId,
  supervisorId,
}: ListSupervisionsArgs = {}): Promise<Supervision[]> {
  const supabase = await createClient();
  let query = supabase
    .from('supervisions')
    .select(
      'id, org_id, patient_id, professional_id, supervisor_id, title, status, created_at, updated_at, patients(full_name), professional:profiles!supervisions_professional_id_fkey(full_name), supervisor:profiles!supervisions_supervisor_id_fkey(full_name)',
    )
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (professionalId) query = query.eq('professional_id', professionalId);
  if (supervisorId) query = query.eq('supervisor_id', supervisorId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromDbSupervision);
}
