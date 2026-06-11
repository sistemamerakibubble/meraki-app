import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbPatient } from '@/lib/supabase/helpers';
import type { Patient } from '@/types/domain';

export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data ? fromDbPatient(data) : null;
}
