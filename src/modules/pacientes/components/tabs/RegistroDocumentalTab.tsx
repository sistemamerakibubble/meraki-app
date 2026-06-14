import Link from 'next/link';
import { CalendarDays, Plus, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BillingStatusBadge } from '@/modules/financeiro/components/BillingStatusBadge';
import { formatDate } from '@/lib/utils/dates';
import { formatBRL } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/constants/routes';
import type { Billing } from '@/types/domain';
import type { PatientAppointmentItem } from '@/modules/pacientes/queries/listPatientAppointments';

export function RegistroDocumentalTab({
  patientId,
  appointments,
  billings,
}: {
  patientId: string;
  appointments: PatientAppointmentItem[];
  billings: Billing[];
}) {
  const pendingCents = billings
    .filter((b) => b.status === 'pendente' && b.type === 'receita')
    .reduce((s, b) => s + b.amountCents, 0);
  const paidCents = billings
    .filter((b) => b.status === 'pago' && b.type === 'receita')
    .reduce((s, b) => s + b.amountCents, 0);

  return (
    <div className="space-y-6">
      {/* ── Agendamentos ───────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Agendamentos
            </CardTitle>
            <p className="text-sm text-muted-foreground">Sessões futuras e passadas do cliente.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`${routes.agenda}?patientId=${patientId}`}>
              <Plus className="mr-2 h-4 w-4" /> Novo agendamento
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filtro de status */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['Todos', 'Futuros', 'Passados'].map((f) => (
              <span
                key={f}
                className={cn(
                  'rounded-full px-4 py-1 text-sm font-medium cursor-pointer border transition-colors',
                  f === 'Todos'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent border-border hover:bg-muted',
                )}
              >
                {f}
              </span>
            ))}
          </div>

          {appointments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado.</p>
              <Button asChild variant="outline" className="mt-3" size="sm">
                <Link href={`${routes.agenda}?patientId=${patientId}`}>
                  <Plus className="mr-2 h-4 w-4" /> Agendar sessão
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Profissional</th>
                    <th className="px-4 py-3 hidden md:table-cell">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(a.date)}</td>
                      <td className="px-4 py-3 capitalize">{a.type ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          a.status === 'realizada' ? 'bg-emerald-100 text-emerald-700' :
                          a.status === 'cancelada' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700',
                        )}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.professionalName ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{a.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Recebimentos ───────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Recebimentos
            </CardTitle>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.financeiro}>
              <Plus className="mr-2 h-4 w-4" /> Novo lançamento
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-lg font-semibold text-amber-600">{formatBRL(pendingCents)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Efetivado</p>
              <p className="text-lg font-semibold text-emerald-600">{formatBRL(paidCents)}</p>
            </div>
          </div>

          {/* Filtro */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['Pendentes', 'Efetivados', 'Todos'].map((f) => (
              <span
                key={f}
                className={cn(
                  'rounded-full px-4 py-1 text-sm font-medium cursor-pointer border transition-colors',
                  f === 'Pendentes'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent border-border hover:bg-muted',
                )}
              >
                {f}
              </span>
            ))}
          </div>

          {billings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum lançamento financeiro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {billings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {b.type === 'receita' ? (
                            <ArrowDownLeft className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-destructive flex-shrink-0" />
                          )}
                          <span className="truncate max-w-[160px]">{b.description}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(b.dueDate)}</td>
                      <td className={cn(
                        'px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap',
                        b.type === 'receita' ? 'text-emerald-600' : 'text-destructive',
                      )}>
                        {formatBRL(b.amountCents)}
                      </td>
                      <td className="px-4 py-3">
                        <BillingStatusBadge status={b.derivedStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
