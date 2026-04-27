import { Calendar, DollarSign, Clock, CreditCard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatBRL } from '@/lib/utils/money';
import type { DashboardStats } from '@/modules/dashboard/queries/getStats';

export function StatsRow({ stats }: { stats: DashboardStats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Atendimentos Hoje</CardDescription>
            <CardTitle className="text-4xl">{stats.appointmentsToday.total}</CardTitle>
          </div>
          <Calendar className="h-5 w-5 text-primary" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {stats.appointmentsToday.confirmed} confirmado(s) ·{' '}
          {stats.appointmentsToday.total - stats.appointmentsToday.confirmed} a confirmar
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Faturamento do Dia</CardDescription>
            <CardTitle className="text-4xl text-emerald-600">
              {formatBRL(stats.revenueTodayCents)}
            </CardTitle>
          </div>
          <DollarSign className="h-5 w-5 text-emerald-600" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Somando pagamentos confirmados hoje
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Pendências Supervisão</CardDescription>
            <CardTitle className="text-4xl">{stats.pendingSupervisions}</CardTitle>
          </div>
          <Clock className="h-5 w-5 text-amber-600" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Casos aguardando revisão
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardDescription>Contas a Pagar</CardDescription>
            <CardTitle className="text-4xl">{formatBRL(stats.billsDueTodayCents)}</CardTitle>
          </div>
          <CreditCard className="h-5 w-5 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Vencendo hoje</CardContent>
      </Card>
    </section>
  );
}
