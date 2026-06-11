'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { reminderSchema } from '@/modules/dashboard/schemas/reminder';
import { routes } from '@/lib/constants/routes';

export type CreateReminderResult = Result<{ id: string }, string>;

export async function createReminderAction(content: string): Promise<CreateReminderResult> {
  const session = await requireUser();

  const parsed = reminderSchema.safeParse({ content });
  if (!parsed.success) {
    return err(parsed.error.flatten().fieldErrors.content?.[0] ?? 'Conteúdo inválido.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      org_id: session.profile.orgId,
      author_id: session.id,
      content: parsed.data.content,
    })
    .select('id')
    .single();

  if (error) return err('Não foi possível criar o lembrete.');

  revalidatePath(routes.dashboard);
  return ok({ id: data.id });
}

export async function toggleReminderAction(id: string): Promise<Result<null, string>> {
  await requireUser();
  const supabase = await createClient();

  const { data: current, error: readErr } = await supabase
    .from('reminders')
    .select('done')
    .eq('id', id)
    .maybeSingle();

  if (readErr || !current) return err('Lembrete não encontrado.');

  const { error } = await supabase
    .from('reminders')
    .update({ done: !current.done })
    .eq('id', id);

  if (error) return err('Não foi possível atualizar o lembrete.');

  revalidatePath(routes.dashboard);
  return ok(null);
}

export async function deleteReminderAction(id: string): Promise<Result<null, string>> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) return err('Não foi possível excluir o lembrete.');

  revalidatePath(routes.dashboard);
  return ok(null);
}
