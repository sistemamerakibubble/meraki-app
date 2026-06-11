'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkPermission } from '@/lib/auth/permissions.server';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string };

export type MarkChargeSentResult = Result<{ ok: true }, FormError>;

const schema = z.object({
  billingIds: z.array(z.string().uuid()).min(1),
  sent: z.boolean(),
});

export async function markChargeSentAction(
  billingIds: string[],
  sent: boolean,
): Promise<MarkChargeSentResult> {
  if (!(await checkPermission('financials.modify'))) {
    return err({ formError: 'Sem permissão.' });
  }

  const parsed = schema.safeParse({ billingIds, sent });
  if (!parsed.success) return err({ formError: 'Dados inválidos.' });

  const supabase = await createClient();

  const { error } = await supabase
    .from('billings')
    .update({ charge_sent_at: sent ? new Date().toISOString() : null } as Record<string, unknown>)
    .in('id', parsed.data.billingIds);

  if (error) return err({ formError: 'Erro ao atualizar.' });

  revalidatePath(routes.financeiro);
  return ok({ ok: true });
}
