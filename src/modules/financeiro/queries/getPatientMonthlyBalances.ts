import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { BillingPlan, NfStatus } from '@/types/domain';

export type PatientMonthlyBalance = {
  patientId: string;
  patientName: string;
  billingPlan: BillingPlan | null;
  packageAmountCents: number;
  extraAmountCents: number;
  totalCharged: number;
  totalPaid: number;
  balanceCents: number;
  paidAt: string | null;
  nfStatus: NfStatus;
  chargeSentAt: string | null;
  billingIds: string[];
};

export async function getPatientMonthlyBalances(month: string): Promise<PatientMonthlyBalance[]> {
  const supabase = await createClient();

  const from = `${month}-01`;
  const [year, m] = month.split('-') as [string, string];
  const nextMonth = Number(m) === 12
    ? `${Number(year) + 1}-01-01`
    : `${year}-${String(Number(m) + 1).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('billings')
    .select(
      'id, patient_id, billing_category, amount_cents, status, paid_at, nf_status, charge_sent_at, patients(id, full_name, billing_plan, package_amount_cents)',
    )
    .eq('type', 'receita')
    .not('patient_id', 'is', null)
    .gte('due_date', from)
    .lt('due_date', nextMonth)
    .order('due_date', { ascending: true });

  if (error) throw error;

  const map = new Map<string, PatientMonthlyBalance>();

  for (const row of data ?? []) {
    if (!row.patient_id) continue;
    const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients;
    if (!patient) continue;

    const existing = map.get(row.patient_id);
    if (!existing) {
      map.set(row.patient_id, {
        patientId: row.patient_id,
        patientName: patient.full_name,
        billingPlan: patient.billing_plan as BillingPlan | null,
        packageAmountCents: row.billing_category === 'pacote' ? row.amount_cents : 0,
        extraAmountCents: row.billing_category === 'extra' ? row.amount_cents : 0,
        totalCharged: row.amount_cents,
        totalPaid: row.status === 'pago' ? row.amount_cents : 0,
        balanceCents: row.status === 'pago' ? 0 : row.amount_cents,
        paidAt: row.status === 'pago' ? row.paid_at : null,
        nfStatus: row.nf_status as NfStatus,
        chargeSentAt: (row as typeof row & { charge_sent_at?: string | null }).charge_sent_at ?? null,
        billingIds: [row.id],
      });
    } else {
      if (row.billing_category === 'pacote') existing.packageAmountCents += row.amount_cents;
      if (row.billing_category === 'extra') existing.extraAmountCents += row.amount_cents;
      existing.totalCharged += row.amount_cents;
      if (row.status === 'pago') {
        existing.totalPaid += row.amount_cents;
        if (!existing.paidAt || (row.paid_at && row.paid_at > existing.paidAt)) {
          existing.paidAt = row.paid_at;
        }
      }
      existing.balanceCents = existing.totalCharged - existing.totalPaid;
      // NF: se algum registro está emitido, mostra emitida
      if (row.nf_status === 'emitida') existing.nfStatus = 'emitida';
      // Cobrança: se algum registro foi enviado, considera enviado
      const sentAt = (row as typeof row & { charge_sent_at?: string | null }).charge_sent_at ?? null;
      if (sentAt && !existing.chargeSentAt) existing.chargeSentAt = sentAt;
      existing.billingIds.push(row.id);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.patientName.localeCompare(b.patientName, 'pt-BR'),
  );
}
