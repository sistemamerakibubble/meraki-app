import { z } from 'zod';

export const expenseCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(80, 'Máximo 80 caracteres'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida')
    .default('#6366f1'),
  description: z.string().max(200).optional().default(''),
});

export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;
