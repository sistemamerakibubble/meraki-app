'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function deleteFolderAction(id: string): Promise<Result<null, string>> {
  await requireUser();
  if (!(await checkPermission('library.modify'))) {
    return err('Sem permissão para excluir pastas.');
  }

  const supabase = await createClient();

  const { data: files } = await supabase
    .from('library_files')
    .select('storage_path')
    .eq('folder_id', id);

  const paths = (files ?? []).map((f) => f.storage_path);
  if (paths.length > 0) {
    const { error: storageErr } = await supabase.storage.from('library').remove(paths);
    if (storageErr) return err('Não foi possível remover os arquivos da pasta.');
  }

  const { error } = await supabase.from('library_folders').delete().eq('id', id);
  if (error) return err('Não foi possível excluir a pasta.');

  revalidatePath(routes.estudos);
  return ok(null);
}
