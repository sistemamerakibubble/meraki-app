import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbPatientEvolution } from '@/lib/supabase/helpers';
import type { PatientEvolution } from '@/types/domain';

export async function listEvolutions(patientId: string): Promise<PatientEvolution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patient_evolutions')
    .select('id, patient_id, author_id, title, summary, content, created_at, updated_at, profiles(full_name)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromDbPatientEvolution);
}
