import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { fromDbAppointment } from '@/lib/supabase/helpers';
import type { Appointment, AppointmentModality, AppointmentStatus } from '@/types/domain';

export type ListAppointmentsArgs = {
  start: Date;
  end: Date;
  professionalId?: string;
  roomId?: string;
  status?: AppointmentStatus;
  modality?: AppointmentModality;
};

export async function listAppointmentsInRange({
  start,
  end,
  professionalId,
  roomId,
  status,
  modality,
}: ListAppointmentsArgs): Promise<Appointment[]> {
  const supabase = await createClient();
  let query = supabase
    .from('appointments')
    .select(
      '*, patients(full_name), professionals(full_name), rooms(name), makeup_for:appointments!makeup_for_id(starts_at)',
    )
    .gte('starts_at', start.toISOString())
    .lt('starts_at', end.toISOString())
    .order('starts_at', { ascending: true });

  if (professionalId) query = query.eq('professional_id', professionalId);
  if (roomId) query = query.eq('room_id', roomId);
  if (status) query = (query as any).eq('status', status);
  if (modality) query = (query as any).eq('modality', modality);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromDbAppointment);
}
