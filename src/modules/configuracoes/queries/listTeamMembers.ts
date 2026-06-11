import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Role } from '@/types/domain';

export type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
};

export async function listTeamMembers(query?: string): Promise<TeamMember[]> {
  const supabase = await createClient();

  let req = supabase
    .from('profiles')
    .select('id, full_name, role, active, created_at')
    .order('full_name', { ascending: true });

  if (query && query.trim()) {
    req = req.ilike('full_name', `%${query.trim()}%`);
  }

  const { data: profiles, error } = await req;
  if (error) throw error;

  const ids = (profiles ?? []).map((p) => p.id);
  const emails = await emailsForIds(ids);

  return (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    email: emails.get(p.id) ?? '',
    role: p.role,
    active: p.active,
    createdAt: p.created_at,
  }));
}

async function emailsForIds(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const map = new Map<string, string>();
    for (const u of data.users ?? []) {
      if (ids.includes(u.id) && u.email) map.set(u.id, u.email);
    }
    return map;
  } catch {
    return new Map();
  }
}
