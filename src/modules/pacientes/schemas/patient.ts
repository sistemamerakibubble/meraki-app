import { z } from 'zod';
import {
  zDate,
  zEmail,
  zOptionalBrazilianPhone,
  zOptionalCPF,
} from '@/lib/validation/zod-common';

const optionalEmail = z
  .string()
  .optional()
  .transform((v) => (v ? v.trim() : ''))
  .superRefine((v, ctx) => {
    if (!v) return;
    const parsed = zEmail.safeParse(v);
    if (!parsed.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-mail inválido' });
    }
  });

export const patientSchema = z.object({
  fullName: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(200, 'Máximo de 200 caracteres'),
  birthdate: z
    .union([zDate, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  phone: zOptionalBrazilianPhone,
  email: optionalEmail,
  document: zOptionalCPF,
  notes: z.string().max(5000, 'Máximo de 5000 caracteres').optional().default(''),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const patientIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
