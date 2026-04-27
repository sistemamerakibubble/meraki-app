'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { messageSchema } from '@/modules/supervisao/schemas/message';
import { routes } from '@/lib/constants/routes';

export type SendMessageResult = Result<
  { id: string },
  { formError?: string; fieldErrors?: Record<string, string[]> }
>;

export async function sendMessageAction(input: {
  supervisionId: string;
  content: string;
}): Promise<SendMessageResult> {
  const session = await requireUser();

  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();

  const { data: supervision, error: readErr } = await supabase
    .from('supervisions')
    .select('status')
    .eq('id', parsed.data.supervisionId)
    .maybeSingle();

  if (readErr || !supervision) {
    return err({ formError: 'Supervisão não encontrada.' });
  }
  if (supervision.status === 'concluida' || supervision.status === 'cancelada') {
    return err({
      formError:
        supervision.status === 'concluida'
          ? 'Esta supervisão foi concluída e não aceita novas mensagens.'
          : 'Esta supervisão foi cancelada e não aceita novas mensagens.',
    });
  }

  const { data, error } = await supabase
    .from('supervision_messages')
    .insert({
      supervision_id: parsed.data.supervisionId,
      author_id: session.id,
      content: parsed.data.content,
    })
    .select('id')
    .single();

  if (error) {
    return err({ formError: 'Não foi possível enviar a mensagem.' });
  }

  revalidatePath(routes.supervisao);
  return ok({ id: data.id });
}
