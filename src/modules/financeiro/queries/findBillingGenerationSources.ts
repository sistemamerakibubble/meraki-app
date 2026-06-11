import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type PackageBillingPatient = {
  id: string;
  fullName: string;
  billingPlan: 'mensal' | 'quinzenal';
  packageAmountCents: number;
};

export async function listPatientsForPackageBilling(): Promise<PackageBillingPatient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name, billing_plan, package_amount_cents')
    .is('deleted_at', null)
    .eq('active', true)
    .not('billing_plan', 'is', null)
    .not('package_amount_cents', 'is', null)
    .order('full_name', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => row.billing_plan && row.package_amount_cents)
    .map((row) => ({
      id: row.id,
      fullName: row.full_name,
      billingPlan: row.billing_plan as 'mensal' | 'quinzenal',
      packageAmountCents: row.package_amount_cents as number,
    }));
}

export async function listExistingPackageDueDates(dueDates: string[]): Promise<Set<string>> {
  if (dueDates.length === 0) return new Set();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('billings')
    .select('patient_id, due_date')
    .eq('billing_category', 'pacote')
    .in('due_date', dueDates);

  if (error) throw error;

  return new Set((data ?? []).map((row) => `${row.patient_id}|${row.due_date}`));
}

export type ExtraAppointmentForBilling = {
  id: string;
  patientId: string;
  patientName: string | null;
  extraParticipant: string | null;
  date: string;
};

export async function listExtraAppointmentsWithoutBilling(): Promise<
  ExtraAppointmentForBilling[]
> {
  const supabase = await createClient();

  const { data: billed, error: billedError } = await supabase
    .from('billings')
    .select('appointment_id')
    .not('appointment_id', 'is', null);

  if (billedError) throw billedError;
  const billedIds = new Set((billed ?? []).map((row) => row.appointment_id));

  const { data, error } = await supabase
    .from('appointments')
    .select('id, patient_id, extra_participant, starts_at, status, patients(full_name)')
    .eq('type', 'extra')
    .neq('status', 'cancelado')
    .order('starts_at', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => !billedIds.has(row.id))
    .map((row) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: (row.patients as { full_name: string } | null)?.full_name ?? null,
      extraParticipant: row.extra_participant,
      date: row.starts_at.slice(0, 10),
    }));
}
