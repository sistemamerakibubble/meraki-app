import { z } from 'zod';
import { CLINICAL_NOTE_MAX_LENGTH } from '@/lib/constants/limits';

export const clinicalNoteSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  content: z
    .string({ required_error: 'O conteúdo é obrigatório' })
    .min(1, 'O conteúdo é obrigatório')
    .max(CLINICAL_NOTE_MAX_LENGTH, `Máximo de ${CLINICAL_NOTE_MAX_LENGTH} caracteres`),
});

export type ClinicalNoteInput = z.infer<typeof clinicalNoteSchema>;
