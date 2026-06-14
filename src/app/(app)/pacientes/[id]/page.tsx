import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/guards';
import { getPatient } from '@/modules/pacientes/queries/getPatient';
import { getPatientTimeline } from '@/modules/pacientes/queries/getPatientTimeline';
import { listEvolutions } from '@/modules/pacientes/queries/listEvolutions';
import { listPatientNotes } from '@/modules/pacientes/queries/listPatientNotes';
import { listPatientBillings } from '@/modules/pacientes/queries/listPatientBillings';
import { listPatientAppointments } from '@/modules/pacientes/queries/listPatientAppointments';

import { PatientTabsNav } from '@/modules/pacientes/components/PatientTabsNav';
import { parseTab } from '@/modules/pacientes/components/patientTabKey';
import { PatientInfoTab } from '@/modules/pacientes/components/tabs/PatientInfoTab';
import { AcademicoTab } from '@/modules/pacientes/components/tabs/AcademicoTab';
import { SaudeTab } from '@/modules/pacientes/components/tabs/SaudeTab';
import { MedicacaoTab } from '@/modules/pacientes/components/tabs/MedicacaoTab';
import { QueixasTab } from '@/modules/pacientes/components/tabs/QueixasTab';
import { RotinaTab } from '@/modules/pacientes/components/tabs/RotinaTab';
import { AgendamentoTab } from '@/modules/pacientes/components/tabs/AgendamentoTab';
import { RegistroDocumentalTab } from '@/modules/pacientes/components/tabs/RegistroDocumentalTab';
import { SessionsHistoryTab } from '@/modules/pacientes/components/tabs/SessionsHistoryTab';
import { PeriodicEvolutionTab } from '@/modules/pacientes/components/tabs/PeriodicEvolutionTab';
import { PatientNotesTab } from '@/modules/pacientes/components/tabs/PatientNotesTab';
import { GenerateDocumentTab } from '@/modules/pacientes/components/tabs/GenerateDocumentTab';

import { routes } from '@/lib/constants/routes';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ tab?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const patient = await getPatient(id);
  return { title: patient?.fullName ?? 'Cliente' };
}

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [session, patient] = await Promise.all([requireUser(), getPatient(id)]);
  if (!patient) notFound();

  const tab = parseTab(sp.tab);
  const canWriteNotes = session.profile.role === 'admin' || session.profile.role === 'medico';

  const [timeline, evolutions, patientNotes, billings, appointments] = await Promise.all([
    tab === 'sessoes' ? getPatientTimeline(id) : Promise.resolve([]),
    tab === 'evolucao' ? listEvolutions(id) : Promise.resolve([]),
    tab === 'notas' ? listPatientNotes(id) : Promise.resolve([]),
    tab === 'registro' || tab === 'agendamento' ? listPatientBillings(id) : Promise.resolve([]),
    tab === 'registro' || tab === 'agendamento' ? listPatientAppointments(id) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="gap-1 px-2">
          <Link href={routes.pacientes}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar a Clientes
          </Link>
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{patient.fullName}</h1>
        <p className="text-sm text-muted-foreground">
          {patient.email ?? 'Sem e-mail cadastrado'}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <PatientTabsNav active={tab} />

        <div className="min-w-0">
          {tab === 'info' ? <PatientInfoTab patient={patient} /> : null}
          {tab === 'academico' ? <AcademicoTab patient={patient} /> : null}
          {tab === 'saude' ? <SaudeTab patient={patient} /> : null}
          {tab === 'medicacao' ? <MedicacaoTab patient={patient} /> : null}
          {tab === 'queixas' ? <QueixasTab patient={patient} /> : null}
          {tab === 'rotina' ? <RotinaTab patient={patient} /> : null}
          {tab === 'agendamento' ? (
            <AgendamentoTab
              patient={patient}
              appointments={appointments}
              billings={billings}
            />
          ) : null}
          {tab === 'registro' ? (
            <RegistroDocumentalTab
              patientId={patient.id}
              appointments={appointments}
              billings={billings}
            />
          ) : null}
          {tab === 'sessoes' ? (
            <SessionsHistoryTab
              patientId={patient.id}
              entries={timeline}
              canWrite={canWriteNotes}
            />
          ) : null}
          {tab === 'evolucao' ? (
            <PeriodicEvolutionTab
              patientId={patient.id}
              evolutions={evolutions}
              role={session.profile.role}
            />
          ) : null}
          {tab === 'documento' ? (
            <GenerateDocumentTab patient={patient} user={session} orgName="Meraki" />
          ) : null}
          {tab === 'notas' ? (
            <PatientNotesTab patientId={patient.id} notes={patientNotes} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
