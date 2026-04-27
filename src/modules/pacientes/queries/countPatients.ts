import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type PatientCounts = {
  total: number;
  active: number;
};

export async function countPatients(): Promise<PatientCounts> {
  const supabase = await createClient();

  const [{ count: total }, { count: active }] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('active', true),
  ]);

  return {
    total: total ?? 0,
    active: active ?? 0,
  };
}
