'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/modules/supervisao/components/ChatMessage';
import { ChatInput } from '@/modules/supervisao/components/ChatInput';
import { SupervisionStatusBadge } from '@/modules/supervisao/components/SupervisionStatusBadge';
import { useRealtimeMessages } from '@/modules/supervisao/hooks/useRealtimeMessages';
import { changeSupervisionStatusAction } from '@/modules/supervisao/actions/change-status';
import type { Supervision, SupervisionMessage } from '@/types/domain';

export function ChatPanel({
  supervision,
  initialMessages,
  currentUserId,
  isAdmin,
}: {
  supervision: Supervision;
  initialMessages: SupervisionMessage[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const messages = useRealtimeMessages(supervision.id, initialMessages);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [lastCount, setLastCount] = useState(messages.length);

  useEffect(() => {
    if (messages.length !== lastCount) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setLastCount(messages.length);
    }
  }, [messages.length, lastCount]);

  const isSupervisor = supervision.supervisorId === currentUserId;
  const isProfessional = supervision.professionalId === currentUserId;
  const locked =
    supervision.status === 'concluida' || supervision.status === 'cancelada';

  const runChange = (
    next: Supervision['status'],
    successMsg: string,
    condition: boolean,
  ) => {
    if (!condition) return;
    startTransition(async () => {
      const r = await changeSupervisionStatusAction(supervision.id, next);
      if (r.ok) toast.success(successMsg);
      else toast.error(r.error);
    });
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="font-semibold">{supervision.title}</h2>
          <p className="text-xs text-muted-foreground">
            {supervision.patientName ? `Paciente: ${supervision.patientName} · ` : ''}
            Solicitante: {supervision.professionalName ?? '—'} · Supervisor:{' '}
            {supervision.supervisorName ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SupervisionStatusBadge status={supervision.status} />
          {isSupervisor || isAdmin ? (
            <>
              {supervision.status === 'pendente' ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    runChange('em_revisao', 'Revisão iniciada.', true)
                  }
                >
                  Iniciar revisão
                </Button>
              ) : null}
              {supervision.status !== 'concluida' && supervision.status !== 'cancelada' ? (
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => runChange('concluida', 'Supervisão concluída.', true)}
                >
                  Concluir
                </Button>
              ) : null}
            </>
          ) : null}
          {isProfessional || isAdmin ? (
            supervision.status !== 'concluida' && supervision.status !== 'cancelada' ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                className="text-destructive hover:text-destructive"
                onClick={() => runChange('cancelada', 'Supervisão cancelada.', true)}
              >
                Cancelar
              </Button>
            ) : null
          ) : null}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Envie a primeira.
          </p>
        ) : (
          messages.map((m) => (
            <ChatMessage key={m.id} message={m} own={m.authorId === currentUserId} />
          ))
        )}
      </div>

      <ChatInput supervisionId={supervision.id} disabled={locked} />
    </div>
  );
}
