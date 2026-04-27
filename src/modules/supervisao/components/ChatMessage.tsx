import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import type { SupervisionMessage } from '@/types/domain';

export function ChatMessage({
  message,
  own,
}: {
  message: SupervisionMessage;
  own: boolean;
}) {
  const time = new Date(message.createdAt);
  return (
    <div className={cn('flex w-full', own ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[80%]', own && 'text-right')}>
        {!own ? (
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {message.authorName ?? 'Profissional'}
          </div>
        ) : null}
        <div
          className={cn(
            'inline-block whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm',
            own
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-muted text-foreground',
          )}
        >
          {message.content}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground" title={format(time, 'dd/MM/yyyy HH:mm')}>
          {formatDistanceToNow(time, { addSuffix: true, locale: ptBR })}
        </div>
      </div>
    </div>
  );
}
