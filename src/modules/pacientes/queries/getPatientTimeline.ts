import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { PatientTimelineEntry } from '@/modules/pacientes/types';

export async function getPatientTimeline(patientId: string): Promise<PatientTimelineEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinical_notes')
    .select('id, content, created_at, author_id, profiles(full_name)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const profiles = row.profiles as { full_name: string } | { full_name: string }[] | null;
    const authorName = Array.isArray(profiles) ? (profiles[0]?.full_name ?? null) : (profiles?.full_name ?? null);
    return {
      kind: 'note' as const,
      id: row.id,
      createdAt: row.created_at,
      authorName,
      content: row.content,
    };
  });
}
