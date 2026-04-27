import Link from 'next/link';
import { Cake } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { routes } from '@/lib/constants/routes';
import type { BirthdayItem } from '@/modules/dashboard/queries/getBirthdaysOfMonth';

export function BirthdaysCard({ items }: { items: BirthdayItem[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Aniversariantes do mês</CardTitle>
        <Cake className="h-4 w-4 text-primary" aria-hidden />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            Nenhum paciente faz aniversário este mês.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <Link
                  href={routes.patient(p.id)}
                  className="truncate hover:text-primary hover:underline"
                >
                  {p.fullName}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  dia {String(p.dayOfMonth).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
