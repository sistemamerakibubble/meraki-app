'use server';

import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import type { PaymentAccount, AccountType } from '@/types/domain';

export async function listPaymentAccounts(onlyActive = true): Promise<PaymentAccount[]> {
  const session = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from('payment_accounts')
    .select('*')
    .eq('org_id', session.profile.orgId)
    .order('name');

  if (onlyActive) query = query.eq('active', true);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    bankName: row.bank_name,
    accountType: row.account_type as AccountType,
    agency: row.agency,
    accountNumber: row.account_number,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
