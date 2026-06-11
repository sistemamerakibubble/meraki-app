import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type BirthdayItem = {
  id: string;
  fullName: string;
  birthdate: string;
  dayOfMonth: number;
};

export async function getBirthdaysOfMonth(): Promise<BirthdayItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name, birthdate')
    .is('deleted_at', null)
    .eq('active', true)
    .not('birthdate', 'is', null);

  if (error) throw error;

  const month = new Date().getMonth() + 1;

  return (data ?? [])
    .filter((row) => row.birthdate && Number.parseInt(row.birthdate.slice(5, 7), 10) === month)
    .map((row) => ({
      id: row.id,
      fullName: row.full_name,
      birthdate: row.birthdate!,
      dayOfMonth: Number.parseInt(row.birthdate!.slice(8, 10), 10),
    }))
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
}
