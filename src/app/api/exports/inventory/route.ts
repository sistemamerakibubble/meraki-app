import { NextResponse, type NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { listInventoryItems } from '@/modules/acervo/queries/listInventoryItems';

function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: NextRequest) {
  await requireUser();

  const sp = request.nextUrl.searchParams;
  const items = await listInventoryItems({
    q: sp.get('q') || undefined,
    category: sp.get('category') || undefined,
    lowStock: sp.get('lowStock') === '1',
  });

  const header = [
    'nome',
    'descricao',
    'categoria',
    'quantidade',
    'unidade',
    'estoque_minimo',
    'etiqueta',
    'estoque_baixo',
  ];

  const rows = items.map((i) =>
    [
      i.name,
      i.description ?? '',
      i.category ?? '',
      i.quantity,
      i.unit,
      i.minQuantity,
      i.tag ?? '',
      i.lowStock ? 'sim' : 'nao',
    ]
      .map(csvEscape)
      .join(','),
  );

  const csv = '﻿' + [header.join(','), ...rows].join('\n');
  const filename = `acervo-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
