import 'server-only';

import { createClient } from '@/lib/supabase/server';

const DEFAULT_EXPIRES_SECONDS = 300;

export async function getSignedFileUrl(
  fileId: string,
  expiresSeconds: number = DEFAULT_EXPIRES_SECONDS,
): Promise<{ url: string; name: string } | null> {
  const supabase = await createClient();
  const { data: file, error: readErr } = await supabase
    .from('library_files')
    .select('name, storage_path')
    .eq('id', fileId)
    .maybeSingle();

  if (readErr || !file) return null;

  const { data, error } = await supabase.storage
    .from('library')
    .createSignedUrl(file.storage_path, expiresSeconds, { download: file.name });

  if (error || !data?.signedUrl) return null;
  return { url: data.signedUrl, name: file.name };
}
