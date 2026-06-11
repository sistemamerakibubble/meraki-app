import { slugify } from '@/lib/utils/slug';

export function buildStoragePath(
  orgId: string,
  folderId: string | null,
  filename: string,
  uuid: string = crypto.randomUUID(),
): string {
  const parts = filename.split('.');
  const ext = parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : '';
  const base = slugify(parts.join('.') || 'arquivo');
  const bucketFolder = folderId ?? '_root';
  return `${orgId}/${bucketFolder}/${uuid}-${base}${ext}`;
}

export function extractOriginalName(storagePath: string): string {
  const last = storagePath.split('/').pop() ?? '';
  return last.replace(/^[0-9a-f-]{36}-/, '');
}
