import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

import { UserMenu } from '@/modules/auth/components/UserMenu';
import { MainNav } from '@/components/layout/MainNav';
import { MobileNav } from '@/components/layout/MobileNav';
import { routes } from '@/lib/constants/routes';
import type { SessionUser } from '@/types/domain';

export function Header({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center gap-4 lg:gap-8">
        <MobileNav role={user.profile.role} />
        <Link href={routes.dashboard} className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" aria-hidden />
          </span>
          <span>Meraki</span>
        </Link>
        <MainNav role={user.profile.role} />
        <div className="ml-auto">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
