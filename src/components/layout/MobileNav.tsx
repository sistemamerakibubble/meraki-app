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
import type { Role } from '@/types/domain';

type NavItem = { href: string; label: string; roles?: readonly Role[] };

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

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((item) => !item.roles || item.roles.includes(role));

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
