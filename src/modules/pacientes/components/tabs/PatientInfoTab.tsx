import { Mail, Phone, Calendar, FileBadge, Archive } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PatientForm } from '@/modules/pacientes/components/PatientForm';
import { PatientArchiveButton } from '@/modules/pacientes/components/PatientArchiveButton';
import { formatDate } from '@/lib/utils/dates';
import { formatPhone } from '@/lib/utils/phone';
import type { Patient } from '@/types/domain';

function formatCPF(digits: string | null | undefined): string {
  if (!digits) return '—';
  const d = digits.replace(/\D/g, '');
  if (d.length !== 11) return digits;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function PatientInfoTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Informações do paciente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cadastro básico, contato e observações.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PatientForm
            mode={{ kind: 'edit', patient }}
            trigger={<Button variant="outline">Editar</Button>}
          />
          <PatientArchiveButton patientId={patient.id} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="Nome completo">
            <span className="font-medium">{patient.fullName}</span>
          </Field>
          <Field label="Status">
            {!patient.active ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Archive className="h-4 w-4" aria-hidden /> Inativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> Ativo
              </span>
            )}
          </Field>
          <Field label="Nascimento" icon={Calendar}>
            {patient.birthdate ? formatDate(patient.birthdate) : '—'}
          </Field>
          <Field label="CPF" icon={FileBadge}>
            {formatCPF(patient.document)}
          </Field>
          <Field label="Telefone" icon={Phone}>
            {patient.phone ? formatPhone(patient.phone) : '—'}
          </Field>
          <Field label="E-mail" icon={Mail}>
            {patient.email ?? '—'}
          </Field>
        </dl>

        {patient.notes ? (
          <div className="mt-6">
            <p className="text-xs uppercase text-muted-foreground">Observações gerais</p>
            <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
              {patient.notes}
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-muted-foreground">
          Cadastrado em {formatDate(patient.createdAt)} · Atualizado em{' '}
          {formatDate(patient.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Calendar;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-sm">
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
        {children}
      </dd>
    </div>
  );
}
