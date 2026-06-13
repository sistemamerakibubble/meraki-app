import { z } from 'zod';

const optionalDay = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === '') return null;
    const n = typeof v === 'string' ? Number.parseInt(v, 10) : v;
    return Number.isFinite(n) ? n : null;
  })
  .refine((n) => n === null || (n >= 1 && n <= 31), 'Dia inválido');

export const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  brand: z.string().max(50).optional().default(''),
  lastFour: z
    .string()
    .max(4)
    .optional()
    .default('')
    .refine((v) => v === '' || /^\d{4}$/.test(v), 'Informe os 4 últimos dígitos'),
  closingDay: optionalDay,
  dueDay: optionalDay,
});

export type CreditCardInput = z.infer<typeof creditCardSchema>;
