'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { patientSchema } from '@/modules/pacientes/schemas/patient';
import { routes } from '@/lib/constants/routes';

export type CreatePatientResult = Result<
  { id: string },
  { formError?: string; fieldErrors?: Record<string, string[]> }
>;

export async function createPatientAction(
  _prev: CreatePatientResult | null,
  formData: FormData,
): Promise<CreatePatientResult> {
  const session = await requireUser();

  const parsed = parseFormData(patientSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .insert({
      org_id: session.profile.orgId,
      full_name: parsed.data.fullName,
      birthdate: parsed.data.birthdate,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      document: parsed.data.document || null,
      notes: parsed.data.notes || null,
      active: true,
    })
    .select('id')
    .single();

  if (error) {
    return err({ formError: 'Não foi possível criar o paciente. Tente novamente.' });
  }

  revalidatePath(routes.pacientes);
  return ok({ id: data.id });
}
