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
import { MonthPicker } from '@/modules/financeiro/components/MonthPicker';
import { PaymentMethodsManager } from '@/modules/financeiro/components/PaymentMethodsManager';
import { ExpenseCategoriesManager } from '@/modules/financeiro/components/ExpenseCategoriesManager';
import { PayablesView } from '@/modules/financeiro/components/PayablesView';
import { getFinancialSummary } from '@/modules/financeiro/queries/getFinancialSummary';
import { listBillings } from '@/modules/financeiro/queries/listBillings';
import { getPatientMonthlyBalances } from '@/modules/financeiro/queries/getPatientMonthlyBalances';
import { listPaymentAccounts } from '@/modules/financeiro/queries/listPaymentAccounts';
import { listCreditCards } from '@/modules/financeiro/queries/listCreditCards';
import { listExpenseCategories } from '@/modules/financeiro/queries/listExpenseCategories';
import { listUpcomingPayables } from '@/modules/financeiro/queries/listUpcomingPayables';
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
  categoryId?: string;
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

type View = 'lancamentos' | 'contas-a-pagar' | 'saldo' | 'meios-pagamento' | 'categorias';

const TABS: { view: View; label: string; adminOnly?: boolean }[] = [
  { view: 'lancamentos', label: 'Lançamentos' },
  { view: 'contas-a-pagar', label: 'Contas a Pagar' },
  { view: 'saldo', label: 'Saldo Pacientes' },
  { view: 'meios-pagamento', label: 'Meios de Pagamento', adminOnly: true },
  { view: 'categorias', label: 'Categorias', adminOnly: true },
];

export default async function FinanceiroPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await requireUser();
  const canCreate = session.profile.role === 'admin' || session.profile.role === 'recepcao';

  const rawView = sp.view as View | undefined;
  const validViews: View[] = ['lancamentos', 'contas-a-pagar', 'saldo', 'meios-pagamento', 'categorias'];
  const view: View = rawView && validViews.includes(rawView) ? rawView : 'lancamentos';
  const month = sp.month ?? currentMonth();

  const filter = {
    from: sp.from || undefined,
    to: sp.to || undefined,
    status: parseStatus(sp.status),
    type: parseType(sp.type),
    nfStatus: parseNfStatus(sp.nfStatus),
    categoryId: sp.categoryId || undefined,
    page: Number.parseInt(sp.page ?? '1', 10) || 1,
  };

  const [summary, result, patients, balances, accounts, cards, categories, payables] =
    await Promise.all([
      getFinancialSummary({ from: filter.from, to: filter.to }),
      view === 'lancamentos' ? listBillings(filter) : Promise.resolve(null),
      listActivePatients(),
      view === 'saldo' ? getPatientMonthlyBalances(month) : Promise.resolve(null),
      listPaymentAccounts(),
      listCreditCards(),
      listExpenseCategories(),
      view === 'contas-a-pagar' ? listUpcomingPayables() : Promise.resolve(null),
    ]);

  const tabBase = `${routes.financeiro}?`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gestão Financeira</h1>
          <p className="text-muted-foreground">
            Controle receitas, despesas e a saúde financeira da Clínica Meraki
          </p>
        </div>
        {canCreate ? (
          <NewBillingButton
            patients={patients}
            accounts={accounts}
            cards={cards}
            categories={categories}
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

      {/* Navegação em abas */}
      <div className="flex gap-0 border-b overflow-x-auto">
        {TABS.filter((t) => !t.adminOnly || canCreate).map((tab) => (
          <Link
            key={tab.view}
            href={`${tabBase}view=${tab.view}${tab.view === 'saldo' ? `&month=${month}` : ''}`}
            className={cn(
              'whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              view === tab.view
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Lançamentos */}
      {view === 'lancamentos' && result ? (
        <>
          <BillingFilters categories={categories} />
          <BillingsTable
            result={result}
            patients={patients}
            accounts={accounts}
            cards={cards}
            categories={categories}
            role={session.profile.role}
            query={{
              view: 'lancamentos',
              from: filter.from,
              to: filter.to,
              status: filter.status,
              type: filter.type,
              nfStatus: filter.nfStatus,
              categoryId: filter.categoryId,
            }}
          />
        </>
      ) : null}

      {/* Contas a Pagar */}
      {view === 'contas-a-pagar' && payables ? (
        <PayablesView data={payables} categories={categories} />
      ) : null}

      {/* Saldo por Paciente */}
      {view === 'saldo' && balances ? (
        <div className="space-y-4">
          <MonthPicker month={month} />
          <PatientBalancesTable balances={balances} />
        </div>
      ) : null}

      {/* Meios de Pagamento */}
      {view === 'meios-pagamento' && canCreate ? (
        <PaymentMethodsManager accounts={accounts} cards={cards} />
      ) : null}

      {/* Categorias de Despesa */}
      {view === 'categorias' && canCreate ? (
        <ExpenseCategoriesManager categories={categories} />
      ) : null}
    </div>
  );
}
