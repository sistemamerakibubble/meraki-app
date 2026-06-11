import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/constants/routes';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Página não encontrada.</p>
        <Button asChild className="mt-6">
          <Link href={routes.dashboard}>Voltar para o dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
