import { z } from 'zod';
import { normalizePhone } from '@/lib/utils/phone';

export const zEmail = z
  .string({ required_error: 'E-mail é obrigatório' })
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido');

export const zBrazilianPhone = z
  .string()
  .transform(normalizePhone)
  .refine((v) => v.length === 10 || v.length === 11, 'Telefone inválido');

export const zOptionalBrazilianPhone = z
  .string()
  .optional()
  .superRefine((v, ctx) => {
    if (!v) return;
    const digits = v.replace(/\D/g, '');
    if (digits.length !== 10 && digits.length !== 11) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Telefone inválido' });
    }
  })
  .transform((v) => (v ? normalizePhone(v) : ''));

export const zDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD');

export function isValidCPF(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (slice: number): number => {
    let sum = 0;
    for (let i = 0; i < slice; i++) {
      sum += Number(digits[i]) * (slice + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}

export const zCPF = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine(isValidCPF, 'CPF inválido');

export const zOptionalCPF = z
  .string()
  .optional()
  .superRefine((v, ctx) => {
    if (!v) return;
    if (!isValidCPF(v)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF inválido' });
    }
  })
  .transform((v) => (v ? v.replace(/\D/g, '') : ''));
