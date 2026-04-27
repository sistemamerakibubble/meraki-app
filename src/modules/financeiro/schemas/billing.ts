import { z } from 'zod';
import { BILLING_TYPES, BILLING_STATUSES } from '@/types/domain';
import { zDate } from '@/lib/validation/zod-common';

const uuid = z.string().uuid('ID inválido');

const cents = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : v))
  .refine((n) => Number.isFinite(n) && Number.isInteger(n), 'Valor inválido')
  .refine((n) => n > 0, 'Valor deve ser maior que zero');

export const billingSchema = z.object({
  type: z.enum(BILLING_TYPES),
  description: z
    .string({ required_error: 'Descrição é obrigatória' })
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Máximo 500 caracteres'),
  amountCents: cents,
  dueDate: zDate,
  patientId: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => v === null || z.string().uuid().safeParse(v).success, {
      message: 'Paciente inválido',
    }),
  paymentMethod: z.string().max(60, 'Máximo 60 caracteres').optional().default(''),
});

export type BillingInput = z.infer<typeof billingSchema>;

export const billingStatusSchema = z.enum(BILLING_STATUSES);
