'use server';

import { createClient } from '@/lib/supabase/server';

export type PatientAppointmentItem = {
  id: string;
  date: string;
  type: string | null;
  status: string;
  notes: string | null;
  professionalName: string | null;
};

export async function listPatientAppointments(patientId: string): Promise<PatientAppointmentItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('id, starts_at, type, status, notes, professionals(full_name)')
    .eq('patient_id', patientId)
    .order('starts_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((row) => {
    const prof = row.professionals as { full_name: string } | { full_name: string }[] | null;
    const professionalName = Array.isArray(prof) ? (prof[0]?.full_name ?? null) : (prof?.full_name ?? null);
    return {
      id: row.id,
      date: row.starts_at.slice(0, 10),
      type: row.type ?? null,
      status: row.status,
      notes: row.notes ?? null,
      professionalName,
    };
  });
}
