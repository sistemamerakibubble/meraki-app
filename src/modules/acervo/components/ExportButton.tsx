'use client';

import { Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function ExportButton() {
  const sp = useSearchParams();
  const params = new URLSearchParams();
  for (const key of ['q', 'category', 'lowStock']) {
    const v = sp.get(key);
    if (v) params.set(key, v);
  }
  const href = `/api/exports/inventory${params.toString() ? `?${params}` : ''}`;

  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} download>
        <Download className="mr-2 h-4 w-4" aria-hidden />
        Exportar CSV
      </a>
    </Button>
  );
}
