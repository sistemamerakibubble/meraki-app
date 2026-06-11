'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Algo deu errado.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <Button onClick={reset} className="mt-6">
            Tentar de novo
          </Button>
        </div>
      </body>
    </html>
  );
}
