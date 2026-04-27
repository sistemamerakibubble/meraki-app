'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { patientSchema } from '@/modules/pacientes/schemas/patient';
import { routes } from '@/lib/constants/routes';

export type UpdatePatientResult = Result<
  { id: string },
  { formError?: string; fieldErrors?: Record<string, string[]> }
>;

export async function updatePatientAction(
  id: string,
  _prev: UpdatePatientResult | null,
  formData: FormData,
): Promise<UpdatePatientResult> {
  await requireUser();

  const parsed = parseFormData(patientSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('patients')
    .update({
      full_name: parsed.data.fullName,
      birthdate: parsed.data.birthdate,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      document: parsed.data.document || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    return err({ formError: 'Não foi possível salvar as alterações.' });
  }

  revalidatePath(routes.pacientes);
  revalidatePath(routes.patient(id));
  return ok({ id });
}
