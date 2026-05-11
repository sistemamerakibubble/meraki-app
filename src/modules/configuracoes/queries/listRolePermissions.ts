import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { PERMISSIONS, type Permission } from '@/lib/auth/permissions';
import { NON_ADMIN_ROLES, type NonAdminRole } from '@/types/domain';

export type RolePermissionsMatrix = Record<NonAdminRole, Record<Permission, boolean>>;

function emptyMatrix(): RolePermissionsMatrix {
  const m = {} as RolePermissionsMatrix;
  for (const r of NON_ADMIN_ROLES) {
    m[r] = {} as Record<Permission, boolean>;
    for (const k of PERMISSIONS) m[r][k] = false;
  }
  return m;
}

export async function listRolePermissions(): Promise<RolePermissionsMatrix> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('role_permissions')
    .select('role, permission_key, granted');

  if (error) throw error;

  const matrix = emptyMatrix();
  for (const row of data ?? []) {
    if (row.role === 'admin') continue;
    if (!(NON_ADMIN_ROLES as readonly string[]).includes(row.role)) continue;
    if (!(PERMISSIONS as readonly string[]).includes(row.permission_key)) continue;
    matrix[row.role as NonAdminRole][row.permission_key as Permission] = row.granted;
  }
  return matrix;
}
