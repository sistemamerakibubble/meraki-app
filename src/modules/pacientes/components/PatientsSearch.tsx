'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { routes } from '@/lib/constants/routes';
import { debounce } from '@/lib/utils/debounce';

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
  { value: 'todos', label: 'Todos' },
] as const;

export function PatientsSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(sp.get('q') ?? '');
  const [status, setStatus] = useState(sp.get('status') ?? 'ativo');

  const pushQuery = useRef(
    debounce((nextQ: string, nextStatus: string) => {
      const params = new URLSearchParams();
      if (nextQ) params.set('q', nextQ);
      if (nextStatus !== 'ativo') params.set('status', nextStatus);
      startTransition(() => {
        router.push(`${routes.pacientes}${params.toString() ? `?${params}` : ''}`);
      });
    }, 300),
  ).current;

  useEffect(() => {
    pushQuery(q, status);
  }, [q, status, pushQuery]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Buscar por nome, e-mail ou telefone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Buscar pacientes"
        />
      </div>
      <div className="flex gap-1 rounded-md border bg-background p-1">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={status === opt.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatus(opt.value)}
            disabled={pending}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
