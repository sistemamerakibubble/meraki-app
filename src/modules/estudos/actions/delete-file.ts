'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

export async function deleteFileAction(id: string): Promise<Result<null, string>> {
  await requireUser();
  if (!(await checkPermission('library.modify'))) {
    return err('Sem permissão para excluir arquivos.');
  }

  const supabase = await createClient();
  const { data: file, error: readErr } = await supabase
    .from('library_files')
    .select('storage_path, folder_id')
    .eq('id', id)
    .maybeSingle();

  if (readErr || !file) return err('Arquivo não encontrado.');

  const { error: storageErr } = await supabase.storage
    .from('library')
    .remove([file.storage_path]);
  if (storageErr) return err('Não foi possível remover o arquivo do storage.');

  const { error } = await supabase.from('library_files').delete().eq('id', id);
  if (error) return err('Não foi possível excluir o registro do arquivo.');

  revalidatePath(routes.estudos);
  if (file.folder_id) revalidatePath(routes.folder(file.folder_id));
  return ok(null);
}
