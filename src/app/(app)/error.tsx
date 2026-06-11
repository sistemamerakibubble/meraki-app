'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AppError({
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
    <div className="rounded-lg border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">Algo deu errado.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Se o erro persistir, avise a equipe.
      </p>
      <Button onClick={reset} className="mt-4">
        Tentar novamente
      </Button>
    </div>
  );
}
