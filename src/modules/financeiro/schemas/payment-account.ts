import { z } from 'zod';
import { ACCOUNT_TYPES } from '@/types/domain';

export const paymentAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  bankName: z.string().max(100).optional().default(''),
  accountType: z.enum(ACCOUNT_TYPES),
  agency: z.string().max(20).optional().default(''),
  accountNumber: z.string().max(30).optional().default(''),
});

export type PaymentAccountInput = z.infer<typeof paymentAccountSchema>;
