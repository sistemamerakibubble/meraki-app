import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbLibraryFolder } from '@/lib/supabase/helpers';
import type { LibraryFolder } from '@/types/domain';

export async function getFolder(id: string): Promise<LibraryFolder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('library_folders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? fromDbLibraryFolder(data) : null;
}
