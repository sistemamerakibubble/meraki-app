import Link from 'next/link';
import { PatientRow } from '@/modules/pacientes/components/PatientRow';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/constants/routes';
import type { SearchPatientsResult } from '@/modules/pacientes/queries/searchPatients';

export function PatientsList({
  result,
  query,
}: {
  result: SearchPatientsResult;
  query: { q: string; status: string };
}) {
  if (result.items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Nenhum paciente encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {query.q || query.status !== 'ativo'
            ? 'Tente ajustar os filtros ou a busca.'
            : 'Comece cadastrando seu primeiro paciente.'}
        </p>
      </div>
    );
  }

  const hasPrev = result.page > 1;
  const hasNext = result.hasMore;
  const baseParams = new URLSearchParams();
  if (query.q) baseParams.set('q', query.q);
  if (query.status !== 'ativo') baseParams.set('status', query.status);

  const toPage = (p: number) => {
    const params = new URLSearchParams(baseParams);
    if (p > 1) params.set('page', String(p));
    return `${routes.pacientes}${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <div className="space-y-3">
      {result.items.map((patient) => (
        <PatientRow key={patient.id} patient={patient} />
      ))}

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between pt-2">
          <Button asChild variant="ghost" size="sm" disabled={!hasPrev}>
            <Link href={hasPrev ? toPage(result.page - 1) : '#'}>Anterior</Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {result.page} de {Math.max(1, Math.ceil(result.total / result.pageSize))}
          </span>
          <Button asChild variant="ghost" size="sm" disabled={!hasNext}>
            <Link href={hasNext ? toPage(result.page + 1) : '#'}>Próximo</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
