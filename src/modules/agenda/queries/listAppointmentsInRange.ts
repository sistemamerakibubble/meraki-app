import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbAppointment } from '@/lib/supabase/helpers';
import type { Appointment, AppointmentStatus } from '@/types/domain';

export type ListAppointmentsArgs = {
  start: Date;
  end: Date;
  professionalId?: string;
  roomId?: string;
  status?: AppointmentStatus;
};

export async function listAppointmentsInRange({
  start,
  end,
  professionalId,
  roomId,
  status,
}: ListAppointmentsArgs): Promise<Appointment[]> {
  const supabase = await createClient();
  let query = supabase
    .from('appointments')
    .select(
      'id, org_id, patient_id, professional_id, room_id, starts_at, ends_at, status, confirmed, notes, recurrence_group_id, type, makeup_for_id, extra_participant, created_at, updated_at, patients(full_name), professionals(full_name), rooms(name)',
    )
    .gte('starts_at', start.toISOString())
    .lt('starts_at', end.toISOString())
    .order('starts_at', { ascending: true });

  if (professionalId) query = query.eq('professional_id', professionalId);
  if (roomId) query = query.eq('room_id', roomId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromDbAppointment);
}
