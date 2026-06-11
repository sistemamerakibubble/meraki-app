'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Calendar as CalendarIcon, Archive } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PatientForm } from '@/modules/pacientes/components/PatientForm';
import { archivePatientAction } from '@/modules/pacientes/actions/archive-patient';
import type { Patient } from '@/types/domain';
import { formatDate } from '@/lib/utils/dates';
import { formatPhone } from '@/lib/utils/phone';
import { routes } from '@/lib/constants/routes';

export function PatientHeader({ patient }: { patient: Patient }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleArchive = () => {
    if (!confirm('Arquivar este paciente? Ele não aparecerá mais na lista padrão.')) return;
    startTransition(async () => {
      const result = await archivePatientAction(patient.id);
      if (result.ok) {
        toast.success('Paciente arquivado.');
        router.push(routes.pacientes);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="gap-1 px-2">
          <Link href={routes.pacientes}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{patient.fullName}</h1>
              {!patient.active ? (
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  inativo
                </span>
              ) : null}
            </div>
            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-[auto_auto] sm:gap-x-6">
              {patient.birthdate ? (
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" aria-hidden /> Nascimento:{' '}
                  {formatDate(patient.birthdate)}
                </span>
              ) : null}
              {patient.phone ? (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" aria-hidden /> {formatPhone(patient.phone)}
                </span>
              ) : null}
              {patient.email ? (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" aria-hidden /> {patient.email}
                </span>
              ) : null}
            </div>
            {patient.notes ? (
              <p className="max-w-2xl whitespace-pre-wrap pt-2 text-sm">{patient.notes}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-2">
            <PatientForm
              mode={{ kind: 'edit', patient }}
              trigger={<Button variant="outline">Editar</Button>}
            />
            <Button
              variant="ghost"
              onClick={handleArchive}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              <Archive className="mr-2 h-4 w-4" aria-hidden />
              Arquivar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
