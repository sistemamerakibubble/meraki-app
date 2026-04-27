'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updatePasswordSchema } from '@/modules/auth/schemas/update-password';
import { err, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { routes } from '@/lib/constants/routes';

export type UpdatePasswordResult = Result<null, { formError?: string; fieldErrors?: Record<string, string[]> }>;

export async function updatePasswordAction(
  _prev: UpdatePasswordResult | null,
  formData: FormData,
): Promise<UpdatePasswordResult> {
  const parsed = parseFormData(updatePasswordSchema, formData);

  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return err({ formError: 'Não foi possível atualizar a senha. O link pode ter expirado.' });
  }

  redirect(routes.dashboard);
}
