import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { PatientsList } from '@/modules/pacientes/components/PatientsList';
import { PatientsSearch } from '@/modules/pacientes/components/PatientsSearch';
import { PatientForm } from '@/modules/pacientes/components/PatientForm';
import { searchPatients } from '@/modules/pacientes/queries/searchPatients';
import { countPatients } from '@/modules/pacientes/queries/countPatients';
import type { PatientStatus } from '@/modules/pacientes/types';

export const metadata: Metadata = { title: 'Pacientes' };

type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

function parseStatus(value?: string): PatientStatus {
  if (value === 'inativo' || value === 'todos') return value;
  return 'ativo';
}

export default async function PacientesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = sp.q ?? '';
  const status = parseStatus(sp.status);
  const page = Number.parseInt(sp.page ?? '1', 10) || 1;

  const [result, counts] = await Promise.all([
    searchPatients({ q, status, page }),
    countPatients(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Prontuários e Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe as informações dos pacientes de forma eficiente
          </p>
        </div>
        <PatientForm
          mode={{ kind: 'create' }}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Novo Paciente
            </Button>
          }
        />
      </header>

      <section className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_auto_auto]">
        <PatientsSearch />
        <div className="flex items-center gap-6 border-t pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Total</p>
            <p className="text-xl font-semibold">{counts.total}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Ativos</p>
            <p className="text-xl font-semibold">{counts.active}</p>
          </div>
        </div>
      </section>

      <PatientsList result={result} query={{ q, status }} />
    </div>
  );
}
