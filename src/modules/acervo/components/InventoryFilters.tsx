'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { routes } from '@/lib/constants/routes';
import { debounce } from '@/lib/utils/debounce';

export function InventoryFilters({ categories }: { categories: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get('q') ?? '');
  const [category, setCategory] = useState(sp.get('category') ?? 'all');
  const [lowStock, setLowStock] = useState(sp.get('lowStock') === '1');

  const pushQuery = useRef(
    debounce((nextQ: string, nextCat: string, nextLow: boolean) => {
      const params = new URLSearchParams();
      if (nextQ) params.set('q', nextQ);
      if (nextCat && nextCat !== 'all') params.set('category', nextCat);
      if (nextLow) params.set('lowStock', '1');
      router.push(`${routes.acervo}${params.toString() ? `?${params}` : ''}`);
    }, 300),
  ).current;

  useEffect(() => {
    pushQuery(q, category, lowStock);
  }, [q, category, lowStock, pushQuery]);

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_auto_auto]">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, descrição ou etiqueta..."
          className="pl-9"
          aria-label="Buscar itens"
        />
      </div>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="sm:w-56">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="flex items-center gap-2 rounded-md border bg-background px-3">
        <Checkbox
          checked={lowStock}
          onCheckedChange={(v) => setLowStock(!!v)}
          aria-label="Apenas estoque baixo"
        />
        <Label className="cursor-pointer text-sm">Apenas estoque baixo</Label>
      </label>
    </div>
  );
}
