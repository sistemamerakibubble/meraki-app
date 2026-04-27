import { z } from 'zod';
import { MESSAGE_MAX_LENGTH } from '@/lib/constants/limits';

export const messageSchema = z.object({
  supervisionId: z.string().uuid('ID da supervisão inválido'),
  content: z
    .string({ required_error: 'Mensagem vazia' })
    .min(1, 'Mensagem vazia')
    .max(MESSAGE_MAX_LENGTH, `Máximo de ${MESSAGE_MAX_LENGTH} caracteres`),
});

export type MessageInput = z.infer<typeof messageSchema>;
