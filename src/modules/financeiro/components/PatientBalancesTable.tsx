'use client';

import { useTransition } from 'react';
import { Check, Send } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { formatBRL } from '@/lib/utils/money';
import { formatDate } from '@/lib/utils/dates';
import { NfStatusBadge } from '@/modules/financeiro/components/NfStatusBadge';
import { markChargeSentAction } from '@/modules/financeiro/actions/mark-charge-sent';
import type { PatientMonthlyBalance } from '@/modules/financeiro/queries/getPatientMonthlyBalances';

function ChargeSentButton({
  balance,
}: {
  balance: PatientMonthlyBalance;
}) {
  const [pending, startTransition] = useTransition();
  const sent = !!balance.chargeSentAt;

  function toggle() {
    startTransition(async () => {
      await markChargeSentAction(balance.billingIds, !sent);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={sent ? `Enviado em ${formatDate(balance.chargeSentAt!)}` : 'Marcar como enviado'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        sent
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
        pending && 'opacity-50',
      )}
    >
      {sent ? (
        <>
          <Check className="h-3 w-3" aria-hidden />
          Enviado
        </>
      ) : (
        <>
          <Send className="h-3 w-3" aria-hidden />
          Pendente
        </>
      )}
    </button>
  );
}

function BalanceBadge({ balance }: { balance: PatientMonthlyBalance }) {
  const isPaid = balance.balanceCents === 0 && balance.totalPaid > 0;
  const isPartial = balance.totalPaid > 0 && balance.balanceCents > 0;

  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        <Check className="h-3 w-3" aria-hidden />
        Pago
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums',
        isPartial
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
          : 'bg-destructive/10 text-destructive',
      )}
    >
      {formatBRL(balance.balanceCents)}
    </span>
  );
}

export function PatientBalancesTable({
  balances,
}: {
  balances: PatientMonthlyBalance[];
}) {
  if (balances.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Nenhum lançamento encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Gere as cobranças do mês para visualizar os saldos.
        </p>
      </div>
    );
  }

  const totalCharged = balances.reduce((s, b) => s + b.totalCharged, 0);
  const totalPaid = balances.reduce((s, b) => s + b.totalPaid, 0);
  const totalBalance = balances.reduce((s, b) => s + b.balanceCents, 0);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3 text-right">Pacote</th>
              <th className="px-4 py-3 text-right">Extras</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Pago em</th>
              <th className="px-4 py-3">Cobrança</th>
              <th className="px-4 py-3">NF</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {balances.map((b) => (
              <tr key={b.patientId} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{b.patientName}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {b.billingPlan ?? '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {b.packageAmountCents > 0 ? formatBRL(b.packageAmountCents) : '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {b.extraAmountCents > 0 ? (
                    <span className="text-amber-700 dark:text-amber-300">
                      +{formatBRL(b.extraAmountCents)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-600">
                  {formatBRL(b.totalCharged)}
                </td>
                <td className="px-4 py-3">
                  <BalanceBadge balance={b} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {b.paidAt ? formatDate(b.paidAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <ChargeSentButton balance={b} />
                </td>
                <td className="px-4 py-3">
                  <NfStatusBadge status={b.nfStatus} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-muted/40 text-xs font-semibold">
            <tr>
              <td className="px-4 py-3 uppercase text-muted-foreground" colSpan={4}>
                Total
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-emerald-600">
                {formatBRL(totalCharged)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums',
                    totalBalance === 0
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {totalBalance === 0 ? 'Quitado' : formatBRL(totalBalance)}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {formatBRL(totalPaid)} pago
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
