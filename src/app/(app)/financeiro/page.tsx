import type { Metadata } from 'next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/guards';
import { FinancialSummary } from '@/modules/financeiro/components/FinancialSummary';
import { BillingFilters } from '@/modules/financeiro/components/BillingFilters';
import { BillingsTable } from '@/modules/financeiro/components/BillingsTable';
import { NewBillingButton } from '@/modules/financeiro/components/NewBillingButton';
import { getFinancialSummary } from '@/modules/financeiro/queries/getFinancialSummary';
import { listBillings } from '@/modules/financeiro/queries/listBillings';
import { listActivePatients } from '@/modules/agenda/queries/listActivePatients';
import {
  BILLING_STATUSES,
  BILLING_TYPES,
  type BillingDerivedStatus,
  type BillingType,
} from '@/types/domain';

export const metadata: Metadata = { title: 'Financeiro' };

type SearchParams = Promise<{
  from?: string;
  to?: string;
  status?: string;
  type?: string;
  page?: string;
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

export default async function FinanceiroPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await requireUser();
  const canCreate = session.profile.role === 'admin' || session.profile.role === 'recepcao';

  const filter = {
    from: sp.from || undefined,
    to: sp.to || undefined,
    status: parseStatus(sp.status),
    type: parseType(sp.type),
    page: Number.parseInt(sp.page ?? '1', 10) || 1,
  };

  const [summary, result, patients] = await Promise.all([
    getFinancialSummary({ from: filter.from, to: filter.to }),
    listBillings(filter),
    listActivePatients(),
  ]);

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
        }}
      />
    </div>
  );
}
