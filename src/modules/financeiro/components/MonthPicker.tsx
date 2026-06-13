'use client';

import { useRouter } from 'next/navigation';
import { routes } from '@/lib/constants/routes';

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="month-picker" className="text-sm font-medium text-muted-foreground">
        Mês de referência
      </label>
      <input
        id="month-picker"
        type="month"
        defaultValue={month}
        className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(e) => {
          if (e.target.value) {
            router.push(`${routes.financeiro}?view=saldo&month=${e.target.value}`);
          }
        }}
      />
    </div>
  );
}
