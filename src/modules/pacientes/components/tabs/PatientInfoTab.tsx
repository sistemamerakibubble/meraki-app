import {
  Mail,
  Phone,
  Calendar,
  FileBadge,
  Archive,
  MapPin,
  Globe,
  Home,
  Users,
  Heart,
  UserCheck,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PatientForm } from '@/modules/pacientes/components/PatientForm';
import { PatientArchiveButton } from '@/modules/pacientes/components/PatientArchiveButton';
import { formatDate } from '@/lib/utils/dates';
import { formatPhone } from '@/lib/utils/phone';
import type { Patient, Responsavel } from '@/types/domain';

function formatCPF(digits: string | null | undefined): string {
  if (!digits) return '—';
  const d = digits.replace(/\D/g, '');
  if (d.length !== 11) return digits;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function neuroLabel(v: boolean | null): string {
  if (v === true) return 'Sim';
  if (v === false) return 'Não';
  return '—';
}

function ResponsavelSection({ label, data }: { label: string; data: Responsavel }) {
  const hasData = Object.values(data).some((v) => v);
  if (!hasData) return null;
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {data.nome ? <Field label="Nome">{data.nome}</Field> : null}
        {data.nascimento ? (
          <Field label="Nascimento" icon={Calendar}>{formatDate(data.nascimento)}</Field>
        ) : null}
        {data.escolaridade ? <Field label="Escolaridade">{data.escolaridade}</Field> : null}
        {data.profissao ? <Field label="Profissão">{data.profissao}</Field> : null}
        {data.cpf ? <Field label="CPF" icon={FileBadge}>{formatCPF(data.cpf)}</Field> : null}
        {data.rg ? <Field label="RG" icon={FileBadge}>{data.rg}</Field> : null}
        {data.telefone ? (
          <Field label="Celular" icon={Phone}>{formatPhone(data.telefone)}</Field>
        ) : null}
        {data.email ? <Field label="E-mail" icon={Mail}>{data.email}</Field> : null}
      </dl>
    </div>
  );
}

export function PatientInfoTab({ patient }: { patient: Patient }) {
  const hasAnamnese =
    patient.mainComplaints ||
    patient.hadNeuropsychEvaluation !== null ||
    patient.diagnosis ||
    patient.bestSessionPeriod ||
    patient.careType;

  const hasResponsaveis =
    (patient.responsavelMae && Object.values(patient.responsavelMae).some(Boolean)) ||
    (patient.responsavelPai && Object.values(patient.responsavelPai).some(Boolean));

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Informações do Cliente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Dados pessoais, contato, responsáveis e anamnese inicial.
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
      <CardContent className="space-y-8">

        {/* Dados pessoais */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Dados pessoais</p>
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
            <Field label="CPF" icon={FileBadge}>{formatCPF(patient.document)}</Field>
            <Field label="RG" icon={FileBadge}>{patient.rg ?? '—'}</Field>
            <Field label="Nacionalidade" icon={Globe}>{patient.nationality ?? '—'}</Field>
            <Field label="Naturalidade" icon={MapPin}>{patient.birthplace ?? '—'}</Field>
            <Field label="Com quem reside?" icon={Users}>{patient.livesWith ?? '—'}</Field>
            <Field label="Telefone" icon={Phone}>
              {patient.phone ? formatPhone(patient.phone) : '—'}
            </Field>
            <Field label="E-mail" icon={Mail}>{patient.email ?? '—'}</Field>
            {patient.religiaoFamilia ? (
              <Field label="Religião da família" icon={Heart}>{patient.religiaoFamilia}</Field>
            ) : null}
            {patient.irmaos ? (
              <div className="sm:col-span-2">
                <Field label="Irmãos (nome e nascimento)">{patient.irmaos}</Field>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <Field label="Endereço" icon={Home}>{patient.address ?? '—'}</Field>
            </div>
          </dl>
        </div>

        {/* Para avaliação / psicoterapia */}
        {(patient.quemEncaminhou || patient.inicioPsicoterapia) ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Para avaliação / Psicoterapia
            </p>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {patient.quemEncaminhou ? (
                <Field label="Quem encaminhou" icon={UserCheck}>{patient.quemEncaminhou}</Field>
              ) : null}
              {patient.inicioPsicoterapia ? (
                <Field label="Início da psicoterapia" icon={Calendar}>
                  {formatDate(patient.inicioPsicoterapia)}
                </Field>
              ) : null}
            </dl>
          </div>
        ) : null}

        {/* Responsáveis / Familiares */}
        {hasResponsaveis ? (
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Dados dos Responsáveis / Familiares
            </p>
            {patient.responsavelMae ? (
              <ResponsavelSection label="Mãe" data={patient.responsavelMae} />
            ) : null}
            {patient.responsavelPai ? (
              <ResponsavelSection label="Pai" data={patient.responsavelPai} />
            ) : null}
          </div>
        ) : null}

        {/* Anamnese inicial */}
        {hasAnamnese ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Anamnese inicial
            </p>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Field label="Avaliação neuropsicológica prévia">
                {neuroLabel(patient.hadNeuropsychEvaluation)}
              </Field>
              <Field label="Melhor período para sessões">
                {patient.bestSessionPeriod ?? '—'}
              </Field>
              <Field label="Tipo de atendimento">{patient.careType ?? '—'}</Field>
            </dl>
            {patient.mainComplaints ? (
              <div className="mt-4">
                <p className="text-xs uppercase text-muted-foreground">Principais queixas</p>
                <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
                  {patient.mainComplaints}
                </p>
              </div>
            ) : null}
            {patient.diagnosis ? (
              <div className="mt-4">
                <p className="text-xs uppercase text-muted-foreground">Diagnóstico</p>
                <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
                  {patient.diagnosis}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {patient.notes ? (
          <div>
            <p className="text-xs uppercase text-muted-foreground">Observações gerais</p>
            <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
              {patient.notes}
            </p>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
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
