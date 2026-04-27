'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { clinicalNoteSchema } from '@/modules/pacientes/schemas/clinical-note';
import { routes } from '@/lib/constants/routes';

export type AddClinicalNoteResult = Result<
  { id: string },
  { formError?: string; fieldErrors?: Record<string, string[]> }
>;

export async function addClinicalNoteAction(
  _prev: AddClinicalNoteResult | null,
  formData: FormData,
): Promise<AddClinicalNoteResult> {
  const session = await requireUser();

  const parsed = parseFormData(clinicalNoteSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  if (session.profile.role !== 'admin' && session.profile.role !== 'medico') {
    return err({ formError: 'Apenas médicos e administradores podem adicionar anotações.' });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clinical_notes')
    .insert({
      patient_id: parsed.data.patientId,
      author_id: session.id,
      content: parsed.data.content,
    })
    .select('id')
    .single();

  if (error) {
    return err({ formError: 'Não foi possível salvar a anotação.' });
  }

  revalidatePath(routes.patient(parsed.data.patientId));
  return ok({ id: data.id });
}
