import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fromDbProfile } from '@/lib/supabase/helpers';
import { routes } from '@/lib/constants/routes';
import type { Profile, Role, SessionUser } from '@/types/domain';

export async function getCurrentProfile(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? '',
    profile: fromDbProfile(profile),
  };
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getCurrentProfile();
  if (!session) redirect(routes.login);
  if (!session.profile.active) redirect(routes.login);
  return session;
}

export async function requireRole(roles: Role | readonly Role[]): Promise<SessionUser> {
  const session = await requireUser();
  const allowed = Array.isArray(roles) ? roles : [roles as Role];
  if (!allowed.includes(session.profile.role)) {
    redirect(routes.dashboard);
  }
  return session;
}

export type { Profile, Role, SessionUser };
