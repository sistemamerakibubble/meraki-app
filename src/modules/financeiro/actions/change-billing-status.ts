'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { routes } from '@/lib/constants/routes';
import type { BillingStatus } from '@/types/domain';

export async function markBillingPaidAction(id: string): Promise<Result<null, string>> {
  const session = await requireUser();
  if (session.profile.role !== 'admin' && session.profile.role !== 'recepcao') {
    return err('Sem permissão.');
  }

  const supabase = await createClient();
  const { data, error: readErr } = await supabase
    .from('billings')
    .select('status, paid_at')
    .eq('id', id)
    .maybeSingle();

  if (readErr || !data) return err('Lançamento não encontrado.');

  if (data.status === 'pago' && data.paid_at) {
    return ok(null);
  }

  const { error } = await supabase
    .from('billings')
    .update({ status: 'pago', paid_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return err('Não foi possível marcar como pago.');

  revalidatePath(routes.financeiro);
  return ok(null);
}

export async function changeBillingStatusAction(
  id: string,
  next: BillingStatus,
): Promise<Result<null, string>> {
  const session = await requireUser();
  if (session.profile.role !== 'admin' && session.profile.role !== 'recepcao') {
    return err('Sem permissão.');
  }

  const supabase = await createClient();
  const update: { status: BillingStatus; paid_at?: string | null } = { status: next };
  if (next === 'pago') update.paid_at = new Date().toISOString();
  else if (next === 'cancelado' || next === 'pendente') update.paid_at = null;

  const { error } = await supabase.from('billings').update(update).eq('id', id);
  if (error) return err('Não foi possível atualizar o status.');

  revalidatePath(routes.financeiro);
  return ok(null);
}
