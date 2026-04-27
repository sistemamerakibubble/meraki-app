import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbLibraryFolder } from '@/lib/supabase/helpers';
import type { LibraryFolder } from '@/types/domain';

export async function listRootFolders(): Promise<LibraryFolder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('library_folders')
    .select('*')
    .is('parent_id', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(fromDbLibraryFolder);
}
