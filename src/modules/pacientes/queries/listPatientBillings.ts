'use server';

import { createClient } from '@/lib/supabase/server';
import { fromDbBilling } from '@/lib/supabase/helpers';
import type { Billing } from '@/types/domain';

export async function listPatientBillings(patientId: string): Promise<Billing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('billings')
    .select('*, patients(full_name)')
    .eq('patient_id', patientId)
    .order('due_date', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map(fromDbBilling);
}
