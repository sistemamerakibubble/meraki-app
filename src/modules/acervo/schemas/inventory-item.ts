import { z } from 'zod';

const intFromInput = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : v))
  .refine((n) => Number.isFinite(n) && Number.isInteger(n), 'Deve ser um número inteiro')
  .refine((n) => n >= 0, 'Deve ser zero ou positivo');

export const inventoryItemSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(200, 'Máximo 200 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional().default(''),
  category: z.string().max(80, 'Máximo 80 caracteres').optional().default(''),
  quantity: intFromInput,
  unit: z
    .string({ required_error: 'Unidade é obrigatória' })
    .min(1, 'Unidade é obrigatória')
    .max(40, 'Máximo 40 caracteres'),
  minQuantity: intFromInput,
  tag: z.string().max(40, 'Máximo 40 caracteres').optional().default(''),
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
