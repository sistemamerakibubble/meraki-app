'use client';

import { useState, useTransition, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { sendMessageAction } from '@/modules/supervisao/actions/send-message';

export function ChatInput({
  supervisionId,
  disabled,
}: {
  supervisionId: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    const content = value.trim();
    if (!content) return;
    startTransition(async () => {
      const r = await sendMessageAction({ supervisionId, content });
      if (r.ok) {
        setValue('');
        router.refresh();
      } else {
        const msg =
          r.error.formError ?? r.error.fieldErrors?.content?.[0] ?? 'Não foi possível enviar.';
        toast.error(msg);
        router.refresh();
      }
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t bg-card p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          disabled={disabled || pending}
          placeholder={
            disabled
              ? 'Este caso está concluído ou cancelado.'
              : 'Digite sua mensagem... (Enter envia, Shift+Enter quebra linha)'
          }
          className="flex min-h-[44px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button type="submit" disabled={disabled || pending || !value.trim()} size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
    </form>
  );
}
