'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { appointmentSchema } from '@/modules/agenda/schemas/appointment';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreateAppointmentResult = Result<{ id: string }, FormError>;

function mapDbError(message: string | null | undefined): string {
  const msg = message ?? '';
  if (msg.includes('appointments_no_overlap_professional')) {
    return 'Este profissional já tem outro agendamento neste horário.';
  }
  if (msg.includes('appointments_no_overlap_room')) {
    return 'Esta sala já está ocupada neste horário.';
  }
  return 'Não foi possível criar o agendamento.';
}

export async function createAppointmentAction(
  _prev: CreateAppointmentResult | null,
  formData: FormData,
): Promise<CreateAppointmentResult> {
  const session = await requireUser();

  const parsed = parseFormData(appointmentSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      org_id: session.profile.orgId,
      patient_id: parsed.data.patientId,
      professional_id: parsed.data.professionalId,
      room_id: parsed.data.roomId,
      starts_at: new Date(parsed.data.startsAt).toISOString(),
      ends_at: new Date(parsed.data.endsAt).toISOString(),
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single();

  if (error) {
    return err({ formError: mapDbError(error.message) });
  }

  revalidatePath(routes.agenda);
  return ok({ id: data.id });
}
