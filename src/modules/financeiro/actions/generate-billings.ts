'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';
import {
  listExistingPackageDueDates,
  listExtraAppointmentsWithoutBilling,
  listPatientsForPackageBilling,
} from '@/modules/financeiro/queries/findBillingGenerationSources';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };

export type GeneratePackageBillingsResult = Result<{ createdCount: number }, FormError>;
export type GenerateExtraBillingsResult = Result<{ createdCount: number }, FormError>;

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido (use AAAA-MM)');

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function monthLabel(month: string): string {
  const [year, m] = month.split('-') as [string, string];
  const idx = Number.parseInt(m, 10) - 1;
  return `${MONTH_LABELS[idx] ?? m}/${year}`;
}

export async function generatePackageBillingsAction(
  _prev: GeneratePackageBillingsResult | null,
  formData: FormData,
): Promise<GeneratePackageBillingsResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão para gerar cobranças.' });
  }

  const parsed = monthSchema.safeParse(String(formData.get('month') ?? ''));
  if (!parsed.success) {
    return err({ fieldErrors: { month: [parsed.error.issues[0]?.message ?? 'Mês inválido'] } });
  }
  const month = parsed.data;

  const patients = await listPatientsForPackageBilling();
  if (patients.length === 0) {
    return ok({ createdCount: 0 });
  }

  const dueDatesByPatient = new Map<string, string[]>();
  const allDueDates = new Set<string>();
  for (const patient of patients) {
    const dates = patient.billingPlan === 'quinzenal' ? [`${month}-05`, `${month}-20`] : [`${month}-05`];
    dueDatesByPatient.set(patient.id, dates);
    dates.forEach((d) => allDueDates.add(d));
  }

  const existing = await listExistingPackageDueDates([...allDueDates]);

  const supabase = await createClient();
  const label = monthLabel(month);
  let createdCount = 0;

  for (const patient of patients) {
    const dates = dueDatesByPatient.get(patient.id) ?? [];
    for (const dueDate of dates) {
      if (existing.has(`${patient.id}|${dueDate}`)) continue;

      const description =
        patient.billingPlan === 'quinzenal'
          ? `Pacote quinzenal - ${label} (${dueDate === dates[0] ? '1ª' : '2ª'} quinzena)`
          : `Pacote mensal - ${label}`;

      const { error } = await supabase.from('billings').insert({
        org_id: session.profile.orgId,
        patient_id: patient.id,
        type: 'receita',
        billing_category: 'pacote',
        description,
        amount_cents: patient.packageAmountCents,
        due_date: dueDate,
      });

      if (!error) createdCount += 1;
    }
  }

  revalidatePath(routes.financeiro);
  return ok({ createdCount });
}

const extraAmountSchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : v))
  .refine((n) => Number.isFinite(n) && Number.isInteger(n) && n > 0, 'Valor inválido');

export async function generateExtraBillingsAction(
  _prev: GenerateExtraBillingsResult | null,
  formData: FormData,
): Promise<GenerateExtraBillingsResult> {
  const session = await requireUser();
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão para gerar cobranças.' });
  }

  const parsedAmount = extraAmountSchema.safeParse(String(formData.get('amountCents') ?? ''));
  if (!parsedAmount.success) {
    return err({
      fieldErrors: { amountCents: [parsedAmount.error.issues[0]?.message ?? 'Valor inválido'] },
    });
  }

  const appointments = await listExtraAppointmentsWithoutBilling();
  if (appointments.length === 0) {
    return ok({ createdCount: 0 });
  }

  const supabase = await createClient();
  let createdCount = 0;

  for (const appt of appointments) {
    const who = appt.extraParticipant || appt.patientName || 'paciente';
    const { error } = await supabase.from('billings').insert({
      org_id: session.profile.orgId,
      patient_id: appt.patientId,
      appointment_id: appt.id,
      type: 'receita',
      billing_category: 'extra',
      description: `Sessão extra - ${who} (${appt.date})`,
      amount_cents: parsedAmount.data,
      due_date: appt.date,
    });

    if (!error) createdCount += 1;
  }

  revalidatePath(routes.financeiro);
  return ok({ createdCount });
}
