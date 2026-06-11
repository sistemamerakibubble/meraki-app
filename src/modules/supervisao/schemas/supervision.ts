import { z } from 'zod';
import { SUPERVISION_STATUSES } from '@/types/domain';

const uuid = z.string().uuid('ID inválido');

export const supervisionSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(1, 'Título é obrigatório')
    .max(200, 'Máximo 200 caracteres'),
  supervisorId: uuid,
  patientId: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => v === null || z.string().uuid().safeParse(v).success, {
      message: 'Paciente inválido',
    }),
});

export type SupervisionInput = z.infer<typeof supervisionSchema>;

export const supervisionStatusSchema = z.enum(SUPERVISION_STATUSES);
