import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants/limits';

export const updatePasswordSchema = z
  .object({
    password: z
      .string({ required_error: 'Senha é obrigatória' })
      .min(PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`),
    confirmPassword: z.string({ required_error: 'Confirme a senha' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
