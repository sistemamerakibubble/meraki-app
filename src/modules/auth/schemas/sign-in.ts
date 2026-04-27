import { z } from 'zod';
import { zEmail } from '@/lib/validation/zod-common';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants/limits';

export const signInSchema = z.object({
  email: zEmail,
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`),
  rememberMe: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .optional()
    .transform((v) => v === 'on' || v === 'true' || v === true),
});

export type SignInInput = z.infer<typeof signInSchema>;
