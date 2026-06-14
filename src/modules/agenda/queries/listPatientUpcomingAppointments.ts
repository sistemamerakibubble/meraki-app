'use server';

import { createClient } from '@/lib/supabase/server';

export type UpcomingAppointmentItem = {
  id: string;
  startsAt: string;
  endsAt: string;
  type: string;
  status: string;
};

export async function listPatientUpcomingAppointments(
  patientId: string,
): Promise<UpcomingAppointmentItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('id, starts_at, ends_at, type, status')
    .eq('patient_id', patientId)
    .in('status', ['agendado', 'confirmado'])
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(60);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    type: row.type ?? 'pacote',
    status: row.status,
  }));
}
