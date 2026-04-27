import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils/dates';
import type { PatientTimelineEntry } from '@/modules/pacientes/types';

export function PatientTimeline({ entries }: { entries: PatientTimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico clínico</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Nenhuma anotação registrada ainda.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico clínico</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id} className="border-l-2 border-primary/30 pl-4">
              <header className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium">{entry.authorName ?? 'Profissional'}</span>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={entry.createdAt}
                >
                  {formatDateTime(entry.createdAt)}
                </time>
              </header>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{entry.content}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
