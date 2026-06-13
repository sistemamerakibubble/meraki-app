'use client';

import type { ReactNode } from 'react';
import { BillingForm } from '@/modules/financeiro/components/BillingForm';
import type { CreditCard, ExpenseCategory, PaymentAccount } from '@/types/domain';

export function NewBillingButton({
  patients,
  accounts,
  cards,
  categories,
  trigger,
}: {
  patients: { id: string; fullName: string }[];
  accounts: PaymentAccount[];
  cards: CreditCard[];
  categories: ExpenseCategory[];
  trigger: ReactNode;
}) {
  return (
    <BillingForm
      mode={{ kind: 'create' }}
      patients={patients}
      accounts={accounts}
      cards={cards}
      categories={categories}
      trigger={trigger}
    />
  );
}
