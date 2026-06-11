'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  { href: routes.pacientes, label: 'Pacientes', permission: 'patients.view' },
  { href: routes.financeiro, label: 'Financeiro', permission: 'financials.view' },
  { href: routes.acervo, label: 'Acervo Técnico', permission: 'inventory.view' },
  { href: routes.supervisao, label: 'Supervisão' },
  { href: routes.estudos, label: 'Estudos', permission: 'library.view' },
  { href: routes.configuracoes, label: 'Configurações', roles: ['admin'] as const },
];

export function MobileNav({
  role,
  permissions,
}: {
  role: Role;
  permissions: PermissionMap;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.permission && !permissions[item.permission]) return false;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Navegação</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-2 pb-6">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
