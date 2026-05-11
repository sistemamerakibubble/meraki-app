import type { ReactNode } from 'react';
import { requireUser } from '@/lib/auth/guards';
import { getCurrentPermissions } from '@/lib/auth/permissions.server';
import { AppShell } from '@/components/layout/AppShell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [user, permissions] = await Promise.all([requireUser(), getCurrentPermissions()]);
  return (
    <AppShell user={user} permissions={permissions}>
      {children}
    </AppShell>
  );
}
