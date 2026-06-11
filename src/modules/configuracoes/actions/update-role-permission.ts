'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { PERMISSIONS, type Permission } from '@/lib/auth/permissions';
import { NON_ADMIN_ROLES, type NonAdminRole } from '@/types/domain';
import { routes } from '@/lib/constants/routes';

export async function updateRolePermissionAction(
  role: NonAdminRole,
  permissionKey: Permission,
  granted: boolean,
): Promise<Result<null, string>> {
  const session = await requireRole('admin');

  if (!(NON_ADMIN_ROLES as readonly string[]).includes(role)) {
    return err('Função inválida.');
  }
  if (!(PERMISSIONS as readonly string[]).includes(permissionKey)) {
    return err('Permissão inválida.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('role_permissions')
    .upsert(
      {
        org_id: session.profile.orgId,
        role,
        permission_key: permissionKey,
        granted,
      },
      { onConflict: 'org_id,role,permission_key' },
    );

  if (error) return err('Não foi possível atualizar a permissão.');

  revalidatePath(routes.configuracoes);
  return ok(null);
}
