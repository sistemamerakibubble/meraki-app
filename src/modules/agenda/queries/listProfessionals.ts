import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbProfessional } from '@/lib/supabase/helpers';
import type { Professional } from '@/types/domain';

export async function listProfessionals(): Promise<Professional[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('professionals')
    .select('*, profiles!profile_id(role)')
    .eq('active', true)
    .order('full_name', { ascending: true });

  // Filtra profissionais vinculados a perfis admin (ex: administração)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = (data ?? []).filter((p: any) => {
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    return !profile || profile.role !== 'admin';
  });

  if (error) throw error;
  return filtered.map(fromDbProfessional);
}
