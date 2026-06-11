import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/guards';
import { FinancialSummary } from '@/modules/financeiro/components/FinancialSummary';
import { BillingFilters } from '@/modules/financeiro/components/BillingFilters';
import { BillingsTable } from '@/modules/financeiro/components/BillingsTable';
import { NewBillingButton } from '@/modules/financeiro/components/NewBillingButton';
import { GenerateBillingsPanel } from '@/modules/financeiro/components/GenerateBillingsPanel';
import { PatientBalancesTable } from '@/modules/financeiro/components/PatientBalancesTable';
import { getFinancialSummary } from '@/modules/financeiro/queries/getFinancialSummary';
import { listBillings } from '@/modules/financeiro/queries/listBillings';
import { getPatientMonthlyBalances } from '@/modules/financeiro/queries/getPatientMonthlyBalances';
import { listActivePatients } from '@/modules/agenda/queries/listActivePatients';
import {
  BILLING_STATUSES,
  BILLING_TYPES,
  NF_STATUSES,
  type BillingDerivedStatus,
  type BillingType,
  type NfStatus,
} from '@/types/domain';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/constants/routes';

export const metadata: Metadata = { title: 'Financeiro' };

type SearchParams = Promise<{
  from?: string;
  to?: string;
  status?: string;
  type?: string;
  nfStatus?: string;
  page?: string;
  view?: string;
  month?: string;
}>;

const DERIVED_STATUSES: readonly string[] = [...BILLING_STATUSES, 'atrasado'];

function parseStatus(value?: string): BillingDerivedStatus | undefined {
  if (value && DERIVED_STATUSES.includes(value)) return value as BillingDerivedStatus;
  return undefined;
}

function parseType(value?: string): BillingType | undefined {
  if (value && (BILLING_TYPES as readonly string[]).includes(value)) {
    return value as BillingType;
  }
  return undefined;
}

function parseNfStatus(value?: string): NfStatus | undefined {
  if (value && (NF_STATUSES as readonly string[]).includes(value)) {
    return value as NfStatus;
  }
  return undefined;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export default async function FinanceiroPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await requireUser();
  const canCreate = session.profile.role === 'admin' || session.profile.role === 'recepcao';

  const view = sp.view === 'saldo' ? 'saldo' : 'lancamentos';
  const month = sp.month ?? currentMonth();

  const filter = {
    from: sp.from || undefined,
    to: sp.to || undefined,
    status: parseStatus(sp.status),
    type: parseType(sp.type),
    nfStatus: parseNfStatus(sp.nfStatus),
    page: Number.parseInt(sp.page ?? '1', 10) || 1,
  };

  const [summary, result, patients, balances] = await Promise.all([
    getFinancialSummary({ from: filter.from, to: filter.to }),
    view === 'lancamentos' ? listBillings(filter) : Promise.resolve(null),
    listActivePatients(),
    view === 'saldo' ? getPatientMonthlyBalances(month) : Promise.resolve(null),
  ]);

  const tabBase = `${routes.financeiro}?`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gestão Financeira</h1>
          <p className="text-muted-foreground">
            Monitore o faturamento, acompanhe os pagamentos e gerencie a saúde financeira da sua
            clínica
          </p>
        </div>
        {canCreate ? (
          <NewBillingButton
            patients={patients}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Novo lançamento
              </Button>
            }
          />
        ) : null}
      </header>

      <FinancialSummary summary={summary} />
      {canCreate ? <GenerateBillingsPanel /> : null}

      {/* Tabs de visualização */}
      <div className="flex gap-1 border-b">
        <Link
          href={`${tabBase}view=lancamentos`}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            view === 'lancamentos'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          Lançamentos
        </Link>
        <Link
          href={`${tabBase}view=saldo&month=${month}`}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            view === 'saldo'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          Saldo por Paciente
        </Link>
      </div>

      {view === 'lancamentos' && result ? (
        <>
          <BillingFilters />
          <BillingsTable
            result={result}
            patients={patients}
            role={session.profile.role}
            query={{
              from: filter.from,
              to: filter.to,
              status: filter.status,
              type: filter.type,
              nfStatus: filter.nfStatus,
            }}
          />
        </>
      ) : null}

      {view === 'saldo' && balances ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label htmlFor="month-picker" className="text-sm font-medium text-muted-foreground">
              Mês de referência
            </label>
            <form method="GET" action={routes.financeiro}>
              <input type="hidden" name="view" value="saldo" />
              <input
                id="month-picker"
                type="month"
                name="month"
                defaultValue={month}
                className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) => (e.currentTarget.form as HTMLFormElement | null)?.submit()}
              />
            </form>
          </div>
          <PatientBalancesTable balances={balances} />
        </div>
      ) : null}
    </div>
  );
}
