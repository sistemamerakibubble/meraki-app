import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbProfessional } from '@/lib/supabase/helpers';
import type { Professional } from '@/types/domain';

export async function listProfessionals(): Promise<Professional[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('active', true)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(fromDbProfessional);
}
