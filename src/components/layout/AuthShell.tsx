import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-end">
        <div>
          <h1 className="text-4xl font-bold leading-tight">Bem-vindo ao sistema Meraki</h1>
          <p className="mt-3 text-lg text-primary-foreground/80">
            Gestão Inteligente para Saúde e Bem-estar.
          </p>
        </div>
      </aside>
      <main className="flex items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
