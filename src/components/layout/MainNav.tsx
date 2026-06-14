'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/constants/routes';
import type { Permission, PermissionMap } from '@/lib/auth/permissions';
import type { Role } from '@/types/domain';

type NavItem = {
  href: string;
  label: string;
  permission?: Permission;
  roles?: readonly Role[];
};

const NAV: readonly NavItem[] = [
  { href: routes.dashboard, label: 'Dashboard', permission: 'dashboard.view' },
  { href: routes.agenda, label: 'Agenda', permission: 'appointments.view' },
  { href: routes.pacientes, label: 'Clientes', permission: 'patients.view' },
  { href: routes.financeiro, label: 'Financeiro', permission: 'financials.view' },
  { href: routes.acervo, label: 'Acervo Técnico', permission: 'inventory.view' },
  { href: routes.supervisao, label: 'Supervisão' },
  { href: routes.estudos, label: 'Estudos', permission: 'library.view' },
  { href: routes.configuracoes, label: 'Configurações', roles: ['admin'] as const },
];

export function MainNav({
  role,
  permissions,
}: {
  role: Role;
  permissions: PermissionMap;
}) {
  const pathname = usePathname();
  const items = NAV.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.permission && !permissions[item.permission]) return false;
    return true;
  });

  return (
    <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'whitespace-nowrap transition-colors hover:text-foreground/80',
              active ? 'text-primary' : 'text-foreground/60',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
