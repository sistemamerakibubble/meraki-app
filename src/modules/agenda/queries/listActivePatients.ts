import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type PatientOption = { id: string; fullName: string };

export async function listActivePatients(): Promise<PatientOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name')
    .is('deleted_at', null)
    .eq('active', true)
    .order('full_name', { ascending: true })
    .limit(500);

  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, fullName: row.full_name }));
}
