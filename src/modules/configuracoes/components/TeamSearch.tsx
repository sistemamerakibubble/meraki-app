'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { routes } from '@/lib/constants/routes';
import { debounce } from '@/lib/utils/debounce';

export function TeamSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');

  const push = useRef(
    debounce((next: string) => {
      const params = new URLSearchParams(sp);
      if (next) params.set('q', next);
      else params.delete('q');
      router.push(`${routes.configuracoes}${params.toString() ? `?${params}` : ''}`);
    }, 300),
  ).current;

  useEffect(() => {
    push(q);
  }, [q, push]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome..."
        className="pl-9"
        aria-label="Buscar usuários"
      />
    </div>
  );
}
