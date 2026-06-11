import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbRoom } from '@/lib/supabase/helpers';
import type { Room } from '@/types/domain';

export async function listRooms(): Promise<Room[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(fromDbRoom);
}
