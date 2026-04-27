'use client';

import { useOptimistic, useRef, useTransition, type FormEvent } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils/cn';
import {
  createReminderAction,
  deleteReminderAction,
  toggleReminderAction,
} from '@/modules/dashboard/actions/reminders';
import type { Reminder } from '@/types/domain';

type OptimisticOp =
  | { type: 'toggle'; id: string }
  | { type: 'delete'; id: string }
  | { type: 'add'; reminder: Reminder };

function reducer(state: Reminder[], op: OptimisticOp): Reminder[] {
  if (op.type === 'toggle') {
    return state.map((r) => (r.id === op.id ? { ...r, done: !r.done } : r));
  }
  if (op.type === 'delete') {
    return state.filter((r) => r.id !== op.id);
  }
  return [op.reminder, ...state];
}

export function RemindersCard({ reminders }: { reminders: Reminder[] }) {
  const [optimistic, applyOptimistic] = useOptimistic(reminders, reducer);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = inputRef.current?.value.trim() ?? '';
    if (!content) return;

    startTransition(async () => {
      applyOptimistic({
        type: 'add',
        reminder: {
          id: `tmp-${Date.now()}`,
          orgId: '',
          authorId: '',
          content,
          done: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      if (inputRef.current) inputRef.current.value = '';
      const r = await createReminderAction(content);
      if (!r.ok) toast.error(r.error);
    });
  };

  const toggle = (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: 'toggle', id });
      const r = await toggleReminderAction(id);
      if (!r.ok) toast.error(r.error);
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: 'delete', id });
      const r = await deleteReminderAction(id);
      if (!r.ok) toast.error(r.error);
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Lembretes / Post-it's</CardTitle>
        <Check className="h-4 w-4 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input ref={inputRef} placeholder="Novo lembrete..." disabled={pending} />
          <Button type="submit" size="icon" disabled={pending} aria-label="Adicionar">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {optimistic.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhum lembrete. Escreva algo acima.
          </p>
        ) : (
          <ul className="mt-4 space-y-1">
            {optimistic.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent/30"
              >
                <Checkbox
                  checked={r.done}
                  onCheckedChange={() => toggle(r.id)}
                  aria-label={r.done ? 'Marcar como pendente' : 'Marcar como feito'}
                />
                <span
                  className={cn(
                    'flex-1 text-sm',
                    r.done && 'text-muted-foreground line-through',
                  )}
                >
                  {r.content}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
                  onClick={() => remove(r.id)}
                  aria-label="Excluir lembrete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
