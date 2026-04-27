import { z } from 'zod';
import { ROLES } from '@/types/domain';
import { zEmail } from '@/lib/validation/zod-common';

export const inviteUserSchema = z.object({
  email: zEmail,
  fullName: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(200, 'Máximo 200 caracteres'),
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Papel inválido' }) }),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
