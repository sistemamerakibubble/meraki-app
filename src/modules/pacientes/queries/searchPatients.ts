import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { PAGE_SIZE } from '@/lib/constants/limits';
import type { PatientListItem, PatientStatus } from '@/modules/pacientes/types';

export type SearchPatientsArgs = {
  q?: string;
  status?: PatientStatus;
  page?: number;
  pageSize?: number;
};

export type SearchPatientsResult = {
  items: PatientListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export async function searchPatients({
  q = '',
  status = 'ativo',
  page = 1,
  pageSize = PAGE_SIZE,
}: SearchPatientsArgs = {}): Promise<SearchPatientsResult> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('patients')
    .select('id, full_name, birthdate, phone, email, active, created_at', { count: 'exact' })
    .is('deleted_at', null);

  if (status === 'ativo') query = query.eq('active', true);
  if (status === 'inativo') query = query.eq('active', false);

  const term = q.trim();
  if (term) {
    const like = `%${term}%`;
    query = query.or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
  }

  query = query.order('full_name', { ascending: true }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const items: PatientListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    birthdate: row.birthdate,
    phone: row.phone,
    email: row.email,
    active: row.active,
    createdAt: row.created_at,
  }));

  const total = count ?? 0;
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: from + items.length < total,
  };
}
