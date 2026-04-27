'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { evolutionSchema } from '@/modules/pacientes/schemas/evolution';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };

export type CreateEvolutionResult = Result<{ id: string }, FormError>;

export async function createEvolutionAction(
  _prev: CreateEvolutionResult | null,
  formData: FormData,
): Promise<CreateEvolutionResult> {
  const session = await requireUser();
  if (session.profile.role !== 'admin' && session.profile.role !== 'medico') {
    return err({ formError: 'Apenas médicos e administradores podem registrar evoluções.' });
  }

  const parsed = parseFormData(evolutionSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patient_evolutions')
    .insert({
      patient_id: parsed.data.patientId,
      author_id: session.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível registrar a evolução.' });

  revalidatePath(routes.patient(parsed.data.patientId));
  return ok({ id: data.id });
}

export type UpdateEvolutionResult = Result<{ id: string }, FormError>;

export async function updateEvolutionAction(
  id: string,
  _prev: UpdateEvolutionResult | null,
  formData: FormData,
): Promise<UpdateEvolutionResult> {
  await requireUser();

  const parsed = parseFormData(evolutionSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('patient_evolutions')
    .update({
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
    })
    .eq('id', id);

  if (error) return err({ formError: 'Não foi possível salvar.' });

  revalidatePath(routes.patient(parsed.data.patientId));
  return ok({ id });
}

export async function deleteEvolutionAction(
  id: string,
  patientId: string,
): Promise<Result<null, string>> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from('patient_evolutions').delete().eq('id', id);
  if (error) return err('Não foi possível excluir.');
  revalidatePath(routes.patient(patientId));
  return ok(null);
}
