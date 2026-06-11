import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Role } from '@/types/domain';

export type TeamMember = { id: string; fullName: string; role: Role };

export async function listTeamByRoles(roles: readonly Role[]): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('active', true)
    .in('role', roles as unknown as Role[])
    .order('full_name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    role: row.role,
  }));
}

export const listSupervisors = () => listTeamByRoles(['admin', 'supervisor']);
export const listProfessionalsForSupervision = () => listTeamByRoles(['admin', 'medico']);
