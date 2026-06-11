import type { Metadata } from 'next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/guards';
import { SupervisionList } from '@/modules/supervisao/components/SupervisionList';
import { SupervisionForm } from '@/modules/supervisao/components/SupervisionForm';
import { ChatPanel } from '@/modules/supervisao/components/ChatPanel';
import { listSupervisions } from '@/modules/supervisao/queries/listSupervisions';
import { getSupervision } from '@/modules/supervisao/queries/getSupervision';
import { listMessages } from '@/modules/supervisao/queries/listMessages';
import { listSupervisors } from '@/modules/supervisao/queries/listTeamForSupervision';
import { listActivePatients } from '@/modules/agenda/queries/listActivePatients';
import {
  SUPERVISION_STATUSES,
  type SupervisionStatus,
} from '@/types/domain';

export const metadata: Metadata = { title: 'Supervisão' };

type SearchParams = Promise<{ status?: string; caso?: string }>;

function parseStatus(v?: string): SupervisionStatus | undefined {
  if (v && (SUPERVISION_STATUSES as readonly string[]).includes(v)) {
    return v as SupervisionStatus;
  }
  return undefined;
}

export default async function SupervisaoPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await requireUser();

  const [supervisions, supervisors, patients] = await Promise.all([
    listSupervisions({ status: parseStatus(sp.status) }),
    listSupervisors(),
    listActivePatients(),
  ]);

  const selectedId = sp.caso;
  const selected = selectedId ? await getSupervision(selectedId) : null;
  const messages = selected ? await listMessages(selected.id) : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Supervisão Clínica</h1>
          <p className="text-muted-foreground">Revise casos e oriente sua equipe.</p>
        </div>
        <SupervisionForm
          supervisors={supervisors.filter((s) => s.id !== session.id)}
          patients={patients}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Nova supervisão
            </Button>
          }
        />
      </header>

      <div className="grid h-[calc(100vh-16rem)] min-h-[540px] gap-4 lg:grid-cols-[340px_1fr]">
        <SupervisionList supervisions={supervisions} selectedId={selected?.id} />
        {selected ? (
          <ChatPanel
            supervision={selected}
            initialMessages={messages}
            currentUserId={session.id}
            isAdmin={session.profile.role === 'admin'}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border bg-card">
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              Selecione um caso na lista ao lado ou crie uma nova supervisão.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
