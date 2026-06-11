import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbSupervision } from '@/lib/supabase/helpers';
import type { Supervision } from '@/types/domain';

export async function getSupervision(id: string): Promise<Supervision | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('supervisions')
    .select(
      'id, org_id, patient_id, professional_id, supervisor_id, title, status, created_at, updated_at, patients(full_name), professional:profiles!supervisions_professional_id_fkey(full_name), supervisor:profiles!supervisions_supervisor_id_fkey(full_name)',
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? fromDbSupervision(data) : null;
}
