import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbLibraryFile } from '@/lib/supabase/helpers';
import type { LibraryFile } from '@/types/domain';

export async function listRecentFiles(limit = 12): Promise<LibraryFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('library_files')
    .select(
      'id, org_id, folder_id, name, storage_path, size_bytes, mime_type, uploaded_by, created_at, profiles(full_name)',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(fromDbLibraryFile);
}
