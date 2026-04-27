import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { StatsRow } from '@/modules/dashboard/components/StatsRow';
import { UpcomingAppointments } from '@/modules/dashboard/components/UpcomingAppointments';
import { WeeklyRevenueChart } from '@/modules/dashboard/components/WeeklyRevenueChart';
import { BirthdaysCard } from '@/modules/dashboard/components/BirthdaysCard';
import { LowStockCard } from '@/modules/dashboard/components/LowStockCard';
import { RemindersCard } from '@/modules/dashboard/components/RemindersCard';

import { getStats } from '@/modules/dashboard/queries/getStats';
import { getUpcomingAppointments } from '@/modules/dashboard/queries/getUpcomingAppointments';
import { getWeeklyRevenueSeries } from '@/modules/dashboard/queries/getWeeklyRevenueSeries';
import { getBirthdaysOfMonth } from '@/modules/dashboard/queries/getBirthdaysOfMonth';
import { getLowStockTop } from '@/modules/dashboard/queries/getLowStockTop';
import { listReminders } from '@/modules/dashboard/queries/listReminders';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await requireUser();

  const [stats, upcoming, weekly, birthdays, lowStock, reminders] = await Promise.all([
    getStats(),
    getUpcomingAppointments(8),
    getWeeklyRevenueSeries(),
    getBirthdaysOfMonth(),
    getLowStockTop(5),
    listReminders(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Olá, {user.profile.fullName.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Aqui está o que está acontecendo na sua clínica hoje.
        </p>
      </header>

      <StatsRow stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="order-1 min-w-0 lg:col-span-2 lg:row-start-1">
          <UpcomingAppointments items={upcoming} />
        </div>
        <div className="order-2 min-w-0 lg:col-span-2 lg:row-start-2">
          <WeeklyRevenueChart data={weekly} />
        </div>
        <div className="order-3 min-w-0 space-y-6 self-start lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <BirthdaysCard items={birthdays} />
          <LowStockCard items={lowStock} />
          <RemindersCard reminders={reminders} />
        </div>
      </div>
    </div>
  );
}
