import { z } from 'zod';
import { REMINDER_MAX_LENGTH } from '@/lib/constants/limits';

export const reminderSchema = z.object({
  content: z
    .string({ required_error: 'Conteúdo é obrigatório' })
    .min(1, 'Conteúdo é obrigatório')
    .max(REMINDER_MAX_LENGTH, `Máximo ${REMINDER_MAX_LENGTH} caracteres`),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
