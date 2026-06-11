'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { SupervisionMessage } from '@/types/domain';

async function fetchAuthorName(
  supabase: ReturnType<typeof createClient>,
  authorId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', authorId)
    .maybeSingle();
  return data?.full_name ?? null;
}

const POLL_INTERVAL_MS = 5_000;

export function useRealtimeMessages(
  supervisionId: string,
  initial: SupervisionMessage[],
): SupervisionMessage[] {
  const [messages, setMessages] = useState<SupervisionMessage[]>(initial);
  const router = useRouter();
  const lastRefreshRef = useRef<number>(0);

  useEffect(() => {
    setMessages(initial);
  }, [initial]);

  useEffect(() => {
    if (!supervisionId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`supervision-${supervisionId}`, {
        config: { broadcast: { self: false } },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'supervision_messages',
          filter: `supervision_id=eq.${supervisionId}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            supervision_id: string;
            author_id: string;
            content: string;
            created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                supervisionId: row.supervision_id,
                authorId: row.author_id,
                authorName: null,
                content: row.content,
                createdAt: row.created_at,
              },
            ];
          });
          const name = await fetchAuthorName(supabase, row.author_id);
          if (name) {
            setMessages((prev) =>
              prev.map((m) => (m.id === row.id ? { ...m, authorName: name } : m)),
            );
          }
        },
      )
      .subscribe();

    const interval = window.setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastRefreshRef.current < POLL_INTERVAL_MS - 500) return;
      lastRefreshRef.current = Date.now();
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [supervisionId, router]);

  return messages;
}
