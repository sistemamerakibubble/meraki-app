'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
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
  if (!(await checkPermission('patients.update'))) {
    return err({ formError: 'Sem permissão para editar pacientes.' });
  }

  const parsed = parseFormData(patientSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from('patients')
    .update({
      full_name: d.fullName,
      birthdate: d.birthdate,
      phone: d.phone || null,
      email: d.email || null,
      document: d.document || null,
      rg: d.rg || null,
      nationality: d.nationality || null,
      birthplace: d.birthplace || null,
      address: d.address || null,
      lives_with: d.livesWith || null,
      main_complaints: d.mainComplaints || null,
      had_neuropsych_evaluation:
        d.hadNeuropsychEvaluation === 'sim'
          ? true
          : d.hadNeuropsychEvaluation === 'nao'
            ? false
            : null,
      diagnosis: d.diagnosis || null,
      best_session_period: d.bestSessionPeriod || null,
      care_type: d.careType || null,
      notes: d.notes || null,
      billing_plan: d.billingPlan || null,
      package_amount_cents: d.packageAmountCents,
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
