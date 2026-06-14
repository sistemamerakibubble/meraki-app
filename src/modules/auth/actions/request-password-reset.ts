'use server';

import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { requestResetSchema } from '@/modules/auth/schemas/request-reset';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { routes } from '@/lib/constants/routes';

export type RequestResetResult = Result<null, { formError?: string; fieldErrors?: Record<string, string[]> }>;

export async function requestPasswordResetAction(
  _prev: RequestResetResult | null,
  formData: FormData,
): Promise<RequestResetResult> {
  const parsed = parseFormData(requestResetSchema, formData);

  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL ?? ''}${routes.resetPassword}`,
  });

  if (error) {
    return err({ formError: 'Não foi possível enviar o e-mail. Tente novamente.' });
  }

  return ok(null);
}
