import { z } from 'zod';
import { zEmail } from '@/lib/validation/zod-common';

export const requestResetSchema = z.object({
  email: zEmail,
});

export type RequestResetInput = z.infer<typeof requestResetSchema>;
