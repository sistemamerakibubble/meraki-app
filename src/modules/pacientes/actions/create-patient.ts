'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
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
  if (!(await checkPermission('patients.create'))) {
    return err({ formError: 'Sem permissão para cadastrar pacientes.' });
  }

  const parsed = parseFormData(patientSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const d = parsed.data;
  const supabase = await createClient();
  const maeFilled = d.maeName || d.maeTelefone || d.maeEmail;
  const paiFilled = d.paiName || d.paiTelefone || d.paiEmail;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('patients') as any)
    .insert({
      org_id: session.profile.orgId,
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
      religiao_familia: d.religiaoFamilia || null,
      irmaos: d.irmaos || null,
      quem_encaminhou: d.quemEncaminhou || null,
      inicio_psicoterapia: d.inicioPsicoterapia || null,
      responsavel_mae: maeFilled ? { nome: d.maeName || undefined, nascimento: d.maeNascimento || undefined, escolaridade: d.maeEscolaridade || undefined, profissao: d.maeProfissao || undefined, cpf: d.maeCpf || undefined, rg: d.maeRg || undefined, telefone: d.maeTelefone || undefined, email: d.maeEmail || undefined } : null,
      responsavel_pai: paiFilled ? { nome: d.paiName || undefined, nascimento: d.paiNascimento || undefined, escolaridade: d.paiEscolaridade || undefined, profissao: d.paiProfissao || undefined, cpf: d.paiCpf || undefined, rg: d.paiRg || undefined, telefone: d.paiTelefone || undefined, email: d.paiEmail || undefined } : null,
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
