'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { UPLOAD_MAX_BYTES } from '@/lib/constants/limits';
import { buildStoragePath } from '@/modules/estudos/utils/buildStoragePath';
import { routes } from '@/lib/constants/routes';

export type UploadFileResult = Result<{ id: string; name: string }, string>;

function parseFolderId(raw: string | null): string | null {
  if (!raw) return null;
  const ok = /^[0-9a-f-]{36}$/i.test(raw);
  return ok ? raw : null;
}

export async function uploadFileAction(formData: FormData): Promise<UploadFileResult> {
  const session = await requireUser();

  const file = formData.get('file');
  const folderId = parseFolderId(formData.get('folderId')?.toString() ?? null);

  if (!(file instanceof File) || file.size === 0) {
    return err('Arquivo ausente.');
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return err(`Arquivo maior que ${Math.round(UPLOAD_MAX_BYTES / 1024 / 1024)} MB.`);
  }

  const supabase = await createClient();

  if (folderId) {
    const { data: folder } = await supabase
      .from('library_folders')
      .select('id')
      .eq('id', folderId)
      .maybeSingle();
    if (!folder) return err('Pasta de destino inválida.');
  }

  const path = buildStoragePath(session.profile.orgId, folderId, file.name);

  const { error: uploadErr } = await supabase.storage
    .from('library')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });

  if (uploadErr) {
    return err('Não foi possível enviar o arquivo.');
  }

  const { data, error } = await supabase
    .from('library_files')
    .insert({
      org_id: session.profile.orgId,
      folder_id: folderId,
      name: file.name,
      storage_path: path,
      size_bytes: file.size,
      mime_type: file.type || 'application/octet-stream',
      uploaded_by: session.id,
    })
    .select('id, name')
    .single();

  if (error) {
    // rollback do objeto já enviado para manter consistência
    await supabase.storage.from('library').remove([path]);
    return err('Não foi possível registrar o arquivo.');
  }

  revalidatePath(routes.estudos);
  if (folderId) revalidatePath(routes.folder(folderId));
  return ok({ id: data.id, name: data.name });
}
