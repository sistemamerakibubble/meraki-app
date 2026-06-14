'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { routes } from '@/lib/constants/routes';
import type { DadosAcademicos, DadosSaude, DadosQueixas, Medicamento, RotinaItem } from '@/types/domain';

type ExtendedFields = {
  dadosAcademicos?: DadosAcademicos;
  dadosSaude?: DadosSaude;
  medicamentos?: Medicamento[];
  atividades?: string;
  rotina?: RotinaItem;
  dadosQueixas?: DadosQueixas;
};

export async function updatePatientExtendedAction(
  patientId: string,
  fields: ExtendedFields,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireUser();
    const supabase = await createClient();

    const update: Record<string, unknown> = {};
    if (fields.dadosAcademicos !== undefined) update.dados_academicos = fields.dadosAcademicos;
    if (fields.dadosSaude !== undefined) update.dados_saude = fields.dadosSaude;
    if (fields.medicamentos !== undefined) update.medicamentos = fields.medicamentos;
    if (fields.atividades !== undefined) update.atividades = fields.atividades;
    if (fields.rotina !== undefined) update.rotina = fields.rotina;
    if (fields.dadosQueixas !== undefined) update.dados_queixas = fields.dadosQueixas;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('patients') as any)
      .update(update)
      .eq('id', patientId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`${routes.patient(patientId)}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
