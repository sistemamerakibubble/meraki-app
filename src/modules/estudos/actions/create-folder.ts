'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { folderSchema } from '@/modules/estudos/schemas/folder';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreateFolderResult = Result<{ id: string }, FormError>;

export async function createFolderAction(
  _prev: CreateFolderResult | null,
  formData: FormData,
): Promise<CreateFolderResult> {
  const session = await requireUser();

  const parsed = parseFormData(folderSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('library_folders')
    .insert({
      org_id: session.profile.orgId,
      name: parsed.data.name,
      parent_id: parsed.data.parentId,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar a pasta.' });

  revalidatePath(routes.estudos);
  if (parsed.data.parentId) revalidatePath(routes.folder(parsed.data.parentId));
  return ok({ id: data.id });
}
