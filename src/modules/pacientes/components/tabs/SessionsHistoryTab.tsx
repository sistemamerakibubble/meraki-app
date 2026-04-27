import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicalNoteForm } from '@/modules/pacientes/components/ClinicalNoteForm';
import { formatDateTime } from '@/lib/utils/dates';
import type { PatientTimelineEntry } from '@/modules/pacientes/types';

export function SessionsHistoryTab({
  patientId,
  entries,
  canWrite,
}: {
  patientId: string;
  entries: PatientTimelineEntry[];
  canWrite: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Linha do tempo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sessões e atendimentos registrados em ordem cronológica.
          </p>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <ol className="space-y-4">
              {entries.map((entry) => (
                <li key={entry.id} className="border-l-2 border-primary/40 pl-4">
                  <header className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium">
                      {entry.authorName ?? 'Profissional'}
                    </span>
                    <time className="text-xs text-muted-foreground" dateTime={entry.createdAt}>
                      {formatDateTime(entry.createdAt)}
                    </time>
                  </header>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{entry.content}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar nova sessão</CardTitle>
          <p className="text-sm text-muted-foreground">
            Descreva o atendimento, evolução observada e condutas tomadas.
          </p>
        </CardHeader>
        <CardContent>
          <ClinicalNoteForm patientId={patientId} canWrite={canWrite} />
        </CardContent>
      </Card>
    </div>
  );
}
