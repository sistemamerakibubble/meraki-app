import { z } from 'zod';

export const patientNoteSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  content: z
    .string({ required_error: 'Conteúdo é obrigatório' })
    .min(1, 'Conteúdo é obrigatório')
    .max(2_000, 'Máximo 2000 caracteres'),
});

export type PatientNoteInput = z.infer<typeof patientNoteSchema>;
