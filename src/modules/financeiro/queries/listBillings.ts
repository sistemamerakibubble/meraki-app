import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbBilling } from '@/lib/supabase/helpers';
import { PAGE_SIZE } from '@/lib/constants/limits';
import type { Billing, BillingDerivedStatus, BillingType, NfStatus } from '@/types/domain';

export type ListBillingsArgs = {
  from?: string;
  to?: string;
  status?: BillingDerivedStatus;
  type?: BillingType;
  nfStatus?: NfStatus;
  categoryId?: string;
  page?: number;
  pageSize?: number;
};

export type ListBillingsResult = {
  items: Billing[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export async function listBillings({
  from,
  to,
  status,
  type,
  nfStatus,
  categoryId,
  page = 1,
  pageSize = PAGE_SIZE,
}: ListBillingsArgs = {}): Promise<ListBillingsResult> {
  const supabase = await createClient();
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  let query = supabase
    .from('billings')
    .select('*, patients(full_name)', { count: 'exact' })
    .order('due_date', { ascending: false })
    .range(fromIdx, toIdx);

  if (from) query = query.gte('due_date', from);
  if (to) query = query.lte('due_date', to);
  if (type) query = query.eq('type', type);
  if (nfStatus) query = query.eq('nf_status', nfStatus);
  if (categoryId) query = query.eq('expense_category_id', categoryId);

  if (status === 'atrasado') {
    const todayISO = new Date().toISOString().slice(0, 10);
    query = query.eq('status', 'pendente').lt('due_date', todayISO);
  } else if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data ?? []).map(fromDbBilling);
  const total = count ?? 0;
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: fromIdx + items.length < total,
  };
}
