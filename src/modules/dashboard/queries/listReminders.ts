import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbReminder } from '@/lib/supabase/helpers';
import type { Reminder } from '@/types/domain';

export async function listReminders(): Promise<Reminder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('done', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromDbReminder);
}
