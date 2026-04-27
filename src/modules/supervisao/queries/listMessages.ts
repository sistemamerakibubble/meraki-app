import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbSupervisionMessage } from '@/lib/supabase/helpers';
import type { SupervisionMessage } from '@/types/domain';

export async function listMessages(supervisionId: string): Promise<SupervisionMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('supervision_messages')
    .select('id, supervision_id, author_id, content, created_at, profiles(full_name)')
    .eq('supervision_id', supervisionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(fromDbSupervisionMessage);
}
