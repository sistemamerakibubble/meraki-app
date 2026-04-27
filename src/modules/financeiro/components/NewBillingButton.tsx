'use client';

import type { ReactNode } from 'react';
import { BillingForm } from '@/modules/financeiro/components/BillingForm';

export function NewBillingButton({
  patients,
  trigger,
}: {
  patients: { id: string; fullName: string }[];
  trigger: ReactNode;
}) {
  return <BillingForm mode={{ kind: 'create' }} patients={patients} trigger={trigger} />;
}
