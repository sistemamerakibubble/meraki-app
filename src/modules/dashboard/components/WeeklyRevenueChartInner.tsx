'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatBRL } from '@/lib/utils/money';
import type { WeeklyRevenuePoint } from '@/modules/dashboard/queries/getWeeklyRevenueSeries';

export function WeeklyRevenueChartInner({ data }: { data: WeeklyRevenuePoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((prev) => {
        if (prev.w === w && prev.h === h) return prev;
        return { w, h };
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const chartData = data.map((p) => ({ label: p.label, reais: p.revenueCents / 100 }));
  const canRender = size.w > 0 && size.h > 0;

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ contain: 'paint' }}
    >
      {canRender ? (
        <BarChart
          width={size.w}
          height={size.h}
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) =>
              v >= 1000 ? `R$${Math.round(v / 1000)}k` : `R$${v}`
            }
            className="text-xs"
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            formatter={(value) => [
              formatBRL(Math.round(Number(value) * 100)),
              'Receita',
            ]}
            labelFormatter={(label) => {
              const s = String(label);
              if (s === 'Dom') return 'Domingo';
              if (s === 'Sáb') return 'Sábado';
              return `${s}-feira`;
            }}
          />
          <Bar dataKey="reais" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : null}
    </div>
  );
}
