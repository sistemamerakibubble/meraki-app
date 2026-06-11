import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbLibraryFile, fromDbLibraryFolder } from '@/lib/supabase/helpers';
import type { LibraryFile, LibraryFolder } from '@/types/domain';

export type FolderContents = {
  subfolders: LibraryFolder[];
  files: LibraryFile[];
};

export async function listFolderContents(folderId: string | null): Promise<FolderContents> {
  const supabase = await createClient();

  const foldersQuery = supabase
    .from('library_folders')
    .select('*')
    .order('name', { ascending: true });

  const filesQuery = supabase
    .from('library_files')
    .select(
      'id, org_id, folder_id, name, storage_path, size_bytes, mime_type, uploaded_by, created_at, profiles(full_name)',
    )
    .order('created_at', { ascending: false });

  const [{ data: folderRows, error: fe }, { data: fileRows, error: fie }] = await Promise.all([
    folderId === null
      ? foldersQuery.is('parent_id', null)
      : foldersQuery.eq('parent_id', folderId),
    folderId === null ? filesQuery.is('folder_id', null) : filesQuery.eq('folder_id', folderId),
  ]);

  if (fe) throw fe;
  if (fie) throw fie;

  return {
    subfolders: (folderRows ?? []).map(fromDbLibraryFolder),
    files: (fileRows ?? []).map(fromDbLibraryFile),
  };
}
