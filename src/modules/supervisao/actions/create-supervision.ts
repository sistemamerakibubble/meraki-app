'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { supervisionSchema } from '@/modules/supervisao/schemas/supervision';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreateSupervisionResult = Result<{ id: string }, FormError>;

export async function createSupervisionAction(
  _prev: CreateSupervisionResult | null,
  formData: FormData,
): Promise<CreateSupervisionResult> {
  const session = await requireUser();

  const parsed = parseFormData(supervisionSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  if (parsed.data.supervisorId === session.id) {
    return err({ formError: 'Supervisor deve ser diferente do solicitante.' });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('supervisions')
    .insert({
      org_id: session.profile.orgId,
      patient_id: parsed.data.patientId,
      professional_id: session.id,
      supervisor_id: parsed.data.supervisorId,
      title: parsed.data.title,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar a supervisão.' });

  revalidatePath(routes.supervisao);
  return ok({ id: data.id });
}
