import Link from 'next/link';
import { Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils/dates';
import { formatPhone } from '@/lib/utils/phone';
import { routes } from '@/lib/constants/routes';
import type { PatientListItem } from '@/modules/pacientes/types';

export function PatientRow({ patient }: { patient: PatientListItem }) {
  return (
    <Link
      href={routes.patient(patient.id)}
      className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
          {!patient.active ? (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              inativo
            </span>
          ) : null}
        </div>
        {patient.birthdate ? (
          <p className="text-sm text-muted-foreground">
            Nascimento: {formatDate(patient.birthdate)}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1 text-sm sm:flex sm:items-center sm:gap-6">
        {patient.phone ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" aria-hidden />
            {formatPhone(patient.phone)}
          </span>
        ) : null}
        {patient.email ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden />
            {patient.email}
          </span>
        ) : null}
        <span className="flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="h-4 w-4" aria-hidden />
          Desde {formatDate(patient.createdAt)}
        </span>
      </div>
    </Link>
  );
}
