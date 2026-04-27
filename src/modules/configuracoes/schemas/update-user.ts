import { z } from 'zod';
import { ROLES } from '@/types/domain';

export const updateUserSchema = z.object({
  fullName: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(200, 'Máximo 200 caracteres'),
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Papel inválido' }) }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
