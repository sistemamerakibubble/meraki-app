'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { patientNoteSchema } from '@/modules/pacientes/schemas/patient-note';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };

export type CreatePatientNoteResult = Result<{ id: string }, FormError>;

export async function createPatientNoteAction(
  _prev: CreatePatientNoteResult | null,
  formData: FormData,
): Promise<CreatePatientNoteResult> {
  const session = await requireUser();

  const parsed = parseFormData(patientNoteSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patient_notes')
    .insert({
      patient_id: parsed.data.patientId,
      author_id: session.id,
      content: parsed.data.content,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível salvar a anotação.' });

  revalidatePath(routes.patient(parsed.data.patientId));
  return ok({ id: data.id });
}

export type UpdatePatientNoteResult = Result<{ id: string }, FormError>;

export async function updatePatientNoteAction(
  id: string,
  _prev: UpdatePatientNoteResult | null,
  formData: FormData,
): Promise<UpdatePatientNoteResult> {
  await requireUser();

  const parsed = parseFormData(patientNoteSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('patient_notes')
    .update({ content: parsed.data.content })
    .eq('id', id);

  if (error) return err({ formError: 'Não foi possível salvar.' });

  revalidatePath(routes.patient(parsed.data.patientId));
  return ok({ id });
}

export async function deletePatientNoteAction(
  id: string,
  patientId: string,
): Promise<Result<null, string>> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from('patient_notes').delete().eq('id', id);
  if (error) return err('Não foi possível excluir.');
  revalidatePath(routes.patient(patientId));
  return ok(null);
}
