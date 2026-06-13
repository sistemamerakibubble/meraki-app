import { z } from 'zod';
import {
  BILLING_TYPES,
  BILLING_STATUSES,
  BILLING_CATEGORIES,
  NF_STATUSES,
  PAYMENT_METHOD_TYPES,
  RECURRENCE_TYPES,
} from '@/types/domain';
import { zDate } from '@/lib/validation/zod-common';

const cents = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : v))
  .refine((n) => Number.isFinite(n) && Number.isInteger(n), 'Valor inválido')
  .refine((n) => n > 0, 'Valor deve ser maior que zero');

const optionalUuid = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine((v) => v === null || z.string().uuid().safeParse(v).success, { message: 'ID inválido' });

export const billingSchema = z
  .object({
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
    billingCategory: z
      .union([z.literal(''), z.enum(BILLING_CATEGORIES)])
      .optional()
      .default(''),
    paymentMethodType: z
      .union([z.literal(''), z.enum(PAYMENT_METHOD_TYPES)])
      .optional()
      .default(''),
    paymentAccountId: optionalUuid,
    creditCardId: optionalUuid,
    expenseCategoryId: optionalUuid,
    notes: z.string().max(500).optional().default(''),
    recurrenceType: z.enum(RECURRENCE_TYPES).default('avulso'),
    installmentCount: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === '') return null;
        const n = typeof v === 'string' ? Number.parseInt(v, 10) : v;
        return Number.isFinite(n) ? n : null;
      })
      .refine((n) => n === null || (n >= 2 && n <= 60), 'Entre 2 e 60 parcelas'),
  })
  .superRefine((data, ctx) => {
    if (data.recurrenceType === 'parcelado' && !data.installmentCount) {
      ctx.addIssue({
        code: 'custom',
        path: ['installmentCount'],
        message: 'Informe o número de parcelas',
      });
    }
    if (
      data.paymentMethodType === 'debito_conta' &&
      data.paymentAccountId === null
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['paymentAccountId'],
        message: 'Selecione a conta bancária',
      });
    }
    if (
      data.paymentMethodType === 'cartao_credito' &&
      data.creditCardId === null
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['creditCardId'],
        message: 'Selecione o cartão de crédito',
      });
    }
  });

export type BillingInput = z.infer<typeof billingSchema>;

export const billingStatusSchema = z.enum(BILLING_STATUSES);
export const nfStatusSchema = z.enum(NF_STATUSES);
