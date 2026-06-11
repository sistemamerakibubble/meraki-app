'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import {
  appointmentSchema,
  type RecurrenceUnit,
} from '@/modules/agenda/schemas/appointment';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreateAppointmentResult = Result<
  { id: string; createdCount: number; skippedCount: number },
  FormError
>;

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

function addInterval(d: Date, every: number, unit: RecurrenceUnit): Date {
  const next = new Date(d);
  if (unit === 'day') next.setDate(next.getDate() + every);
  else if (unit === 'week') next.setDate(next.getDate() + every * 7);
  else if (unit === 'month') next.setMonth(next.getMonth() + every);
  return next;
}

export async function createAppointmentAction(
  _prev: CreateAppointmentResult | null,
  formData: FormData,
): Promise<CreateAppointmentResult> {
  const session = await requireUser();
  if (!(await checkPermission('appointments.modify'))) {
    return err({ formError: 'Sem permissão para criar agendamentos.' });
  }

  const parsed = parseFormData(appointmentSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const start0 = new Date(parsed.data.startsAt);
  const end0 = new Date(parsed.data.endsAt);

  // não-recorrente: insere 1
  if (!parsed.data.recurring) {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        org_id: session.profile.orgId,
        patient_id: parsed.data.patientId,
        professional_id: parsed.data.professionalId,
        room_id: parsed.data.roomId,
        starts_at: start0.toISOString(),
        ends_at: end0.toISOString(),
        notes: parsed.data.notes || null,
        type: parsed.data.type,
        makeup_for_id: parsed.data.makeupForId,
        extra_participant: parsed.data.extraParticipant || null,
      })
      .select('id')
      .single();

    if (error) return err({ formError: mapDbError(error.message) });

    revalidatePath(routes.agenda);
    return ok({ id: data.id, createdCount: 1, skippedCount: 0 });
  }

  // recorrente: gera N ocorrências, insere uma por uma (conflitos individuais não derrubam a série)
  const occurrences = parsed.data.occurrences;
  const every = parsed.data.repeatEvery;
  const unit = parsed.data.repeatUnit;
  const recurrenceGroupId = crypto.randomUUID();

  let firstId: string | null = null;
  let createdCount = 0;
  let skippedCount = 0;
  let lastError: string | null = null;

  for (let i = 0; i < occurrences; i += 1) {
    const starts = i === 0 ? start0 : addInterval(start0, every * i, unit);
    const ends = i === 0 ? end0 : addInterval(end0, every * i, unit);

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        org_id: session.profile.orgId,
        patient_id: parsed.data.patientId,
        professional_id: parsed.data.professionalId,
        room_id: parsed.data.roomId,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        notes: parsed.data.notes || null,
        type: parsed.data.type,
        extra_participant: parsed.data.extraParticipant || null,
        recurrence_group_id: recurrenceGroupId,
      })
      .select('id')
      .single();

    if (error) {
      skippedCount += 1;
      lastError = error.message;
      continue;
    }
    if (firstId === null) firstId = data.id;
    createdCount += 1;
  }

  if (createdCount === 0) {
    return err({ formError: mapDbError(lastError) });
  }

  revalidatePath(routes.agenda);
  return ok({ id: firstId!, createdCount, skippedCount });
}
