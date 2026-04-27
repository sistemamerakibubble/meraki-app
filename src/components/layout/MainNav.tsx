'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/constants/routes';
import type { Role } from '@/types/domain';

type NavItem = {
  href: string;
  label: string;
  roles?: readonly Role[];
};

const NAV: readonly NavItem[] = [
  { href: routes.dashboard, label: 'Dashboard' },
  { href: routes.agenda, label: 'Agenda' },
  { href: routes.pacientes, label: 'Pacientes' },
  { href: routes.financeiro, label: 'Financeiro' },
  { href: routes.acervo, label: 'Acervo Técnico' },
  { href: routes.supervisao, label: 'Supervisão' },
  { href: routes.estudos, label: 'Estudos' },
  { href: routes.configuracoes, label: 'Configurações', roles: ['admin'] as const },
];

export function MainNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => !item.roles || item.roles.includes(role));

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
