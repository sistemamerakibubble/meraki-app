'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeeklyRevenuePoint } from '@/modules/dashboard/queries/getWeeklyRevenueSeries';

const ChartInner = dynamic(
  () =>
    import('@/modules/dashboard/components/WeeklyRevenueChartInner').then(
      (m) => m.WeeklyRevenueChartInner,
    ),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-md bg-muted/30" />,
  },
);

export function WeeklyRevenueChart({ data }: { data: WeeklyRevenuePoint[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Rendimento semanal</CardTitle>
        <p className="text-sm text-muted-foreground">Receita paga por dia da semana</p>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="relative h-[260px] w-full overflow-hidden">
          <ChartInner data={data} />
        </div>
      </div>
    </Card>
  );
}
