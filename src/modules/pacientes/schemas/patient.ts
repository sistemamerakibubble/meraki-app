import { z } from 'zod';
import {
  zDate,
  zEmail,
  zOptionalBrazilianPhone,
  zOptionalCPF,
} from '@/lib/validation/zod-common';
import { BILLING_PLANS } from '@/types/domain';

const cents = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === '') return null;
    const n = typeof v === 'string' ? Number.parseInt(v, 10) : v;
    return Number.isFinite(n) ? n : null;
  })
  .refine((n) => n === null || (Number.isInteger(n) && n > 0), 'Valor inválido');

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

/** Opções dos selects da anamnese — usadas no form e na exibição. */
export const SESSION_PERIODS = ['Manhã', 'Tarde', 'Noite'] as const;
export const CARE_TYPES = ['Presencial', 'Online', 'Híbrido'] as const;

/** Campo de texto opcional, com limite, que normaliza para string. */
const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Máximo de ${max} caracteres`)
    .optional()
    .transform((v) => (v ? v.trim() : ''));

export const patientSchema = z.object({
  // --- Dados pessoais ---
  fullName: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(200, 'Máximo de 200 caracteres'),
  birthdate: z
    .union([zDate, z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  document: zOptionalCPF,
  rg: optionalText(20),
  nationality: optionalText(100),
  birthplace: optionalText(120),
  address: optionalText(300),
  phone: zOptionalBrazilianPhone,
  email: optionalEmail,
  livesWith: optionalText(200),
  // --- Anamnese inicial ---
  mainComplaints: optionalText(5000),
  hadNeuropsychEvaluation: z
    .union([z.literal(''), z.literal('sim'), z.literal('nao')])
    .optional()
    .default(''),
  diagnosis: optionalText(5000),
  bestSessionPeriod: z
    .union([z.literal(''), z.enum(SESSION_PERIODS)])
    .optional()
    .default(''),
  careType: z
    .union([z.literal(''), z.enum(CARE_TYPES)])
    .optional()
    .default(''),
  notes: z.string().max(5000, 'Máximo de 5000 caracteres').optional().default(''),
  // --- Cobrança ---
  billingPlan: z
    .union([z.literal(''), z.enum(BILLING_PLANS)])
    .optional()
    .default(''),
  packageAmountCents: cents,
});

export type PatientInput = z.infer<typeof patientSchema>;

export const patientIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
