import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import type { SessionUser } from '@/types/domain';

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header user={user} />
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
