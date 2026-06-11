import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { routes } from '@/lib/constants/routes';
import {
  PERMISSIONS,
  emptyPermissionMap,
  fullPermissionMap,
  type Permission,
  type PermissionMap,
} from '@/lib/auth/permissions';
import type { Role } from '@/types/domain';

export const getCurrentPermissions = cache(async (): Promise<PermissionMap> => {
  const session = await requireUser();
  return getPermissionsFor(session.profile.role);
});

export const getPermissionsFor = cache(
  async (role: Role): Promise<PermissionMap> => {
    if (role === 'admin') return fullPermissionMap();

    const supabase = await createClient();
    const { data } = await supabase
      .from('role_permissions')
      .select('permission_key, granted')
      .eq('role', role);

    const map = emptyPermissionMap();
    for (const row of data ?? []) {
      if ((PERMISSIONS as readonly string[]).includes(row.permission_key)) {
        map[row.permission_key as Permission] = row.granted;
      }
    }
    return map;
  },
);

export async function hasPermission(key: Permission): Promise<boolean> {
  const map = await getCurrentPermissions();
  return map[key] === true;
}

export async function requirePermission(key: Permission): Promise<void> {
  const allowed = await hasPermission(key);
  if (!allowed) redirect(routes.dashboard);
}

/**
 * Verifica permissão sem redirect — útil em actions onde queremos retornar
 * `Result.err` em vez de redirecionar.
 */
export async function checkPermission(key: Permission): Promise<boolean> {
  return hasPermission(key);
}
