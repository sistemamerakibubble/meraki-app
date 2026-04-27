import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbPatientNote } from '@/lib/supabase/helpers';
import type { PatientNote } from '@/types/domain';

export async function listPatientNotes(patientId: string): Promise<PatientNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patient_notes')
    .select('id, patient_id, author_id, content, created_at, updated_at, profiles(full_name)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromDbPatientNote);
}
