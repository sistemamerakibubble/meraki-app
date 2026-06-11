'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { appointmentSchema } from '@/modules/agenda/schemas/appointment';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type UpdateAppointmentResult = Result<{ id: string }, FormError>;

function mapDbError(message: string | null | undefined): string {
  const msg = message ?? '';
  if (msg.includes('appointments_no_overlap_professional')) {
    return 'Este profissional já tem outro agendamento neste horário.';
  }
  if (msg.includes('appointments_no_overlap_room')) {
    return 'Esta sala já está ocupada neste horário.';
  }
  return 'Não foi possível atualizar o agendamento.';
}

export async function updateAppointmentAction(
  id: string,
  _prev: UpdateAppointmentResult | null,
  formData: FormData,
): Promise<UpdateAppointmentResult> {
  await requireUser();
  if (!(await checkPermission('appointments.modify'))) {
    return err({ formError: 'Sem permissão para editar agendamentos.' });
  }

  const parsed = parseFormData(appointmentSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('appointments')
    .update({
      patient_id: parsed.data.patientId,
      professional_id: parsed.data.professionalId,
      room_id: parsed.data.roomId,
      starts_at: new Date(parsed.data.startsAt).toISOString(),
      ends_at: new Date(parsed.data.endsAt).toISOString(),
      notes: parsed.data.notes || null,
      type: parsed.data.type,
      makeup_for_id: parsed.data.makeupForId,
      extra_participant: parsed.data.extraParticipant || null,
    })
    .eq('id', id);

  if (error) return err({ formError: mapDbError(error.message) });

  revalidatePath(routes.agenda);
  return ok({ id });
}
