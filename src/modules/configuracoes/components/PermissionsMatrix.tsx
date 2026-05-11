'use client';

import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import {
  PERMISSION_GROUPS,
  type Permission,
} from '@/lib/auth/permissions';
import { ROLE_LABELS } from '@/lib/constants/roles';
import { NON_ADMIN_ROLES, type NonAdminRole } from '@/types/domain';
import { updateRolePermissionAction } from '@/modules/configuracoes/actions/update-role-permission';
import type { RolePermissionsMatrix } from '@/modules/configuracoes/queries/listRolePermissions';

type OptimisticOp = {
  role: NonAdminRole;
  key: Permission;
  granted: boolean;
};

function applyOp(state: RolePermissionsMatrix, op: OptimisticOp): RolePermissionsMatrix {
  return {
    ...state,
    [op.role]: { ...state[op.role], [op.key]: op.granted },
  };
}

export function PermissionsMatrix({ initial }: { initial: RolePermissionsMatrix }) {
  const [matrix, applyOptimistic] = useOptimistic(initial, applyOp);
  const [pending, startTransition] = useTransition();

  const toggle = (role: NonAdminRole, key: Permission, next: boolean) => {
    startTransition(async () => {
      applyOptimistic({ role, key, granted: next });
      const r = await updateRolePermissionAction(role, key, next);
      if (!r.ok) toast.error(r.error);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Permissões por função</CardTitle>
        <p className="text-sm text-muted-foreground">
          Marque o que cada função pode acessar. <strong>Admin</strong> tem acesso total
          automaticamente. As permissões valem para toda a clínica.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b">
              <th className="border-b bg-muted/40 px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                Permissão
              </th>
              {NON_ADMIN_ROLES.map((role) => (
                <th
                  key={role}
                  className="border-b bg-muted/40 px-3 py-3 text-center text-xs font-semibold uppercase text-muted-foreground"
                >
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => (
              <RolePermGroup
                key={group.title}
                title={group.title}
                permissions={group.permissions}
                matrix={matrix}
                onToggle={toggle}
                disabled={pending}
              />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function RolePermGroup({
  title,
  permissions,
  matrix,
  onToggle,
  disabled,
}: {
  title: string;
  permissions: Array<{ key: Permission; label: string }>;
  matrix: RolePermissionsMatrix;
  onToggle: (role: NonAdminRole, key: Permission, granted: boolean) => void;
  disabled: boolean;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={NON_ADMIN_ROLES.length + 1}
          className="border-b bg-muted/20 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground"
        >
          {title}
        </td>
      </tr>
      {permissions.map((perm) => (
        <tr key={perm.key} className="border-b">
          <td className="px-4 py-2 font-medium">{perm.label}</td>
          {NON_ADMIN_ROLES.map((role) => {
            const value = matrix[role]?.[perm.key] ?? false;
            return (
              <td
                key={role}
                className={cn(
                  'border-l px-3 py-2 text-center',
                  value && 'bg-primary/5',
                )}
              >
                <Checkbox
                  checked={value}
                  disabled={disabled}
                  onCheckedChange={(v) => onToggle(role, perm.key, !!v)}
                  aria-label={`${perm.label} - ${ROLE_LABELS[role]}`}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
