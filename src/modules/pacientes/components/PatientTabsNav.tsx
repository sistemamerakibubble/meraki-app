'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  IdCard,
  GraduationCap,
  HeartPulse,
  Pill,
  MessageSquareWarning,
  ClipboardList,
  CalendarDays,
  FolderOpen,
  History,
  TrendingUp,
  FileText,
  Pin,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PatientTabKey } from '@/modules/pacientes/components/patientTabKey';

const TABS: ReadonlyArray<{ key: PatientTabKey; label: string; Icon: typeof IdCard }> = [
  { key: 'info', label: 'Informações do Cliente', Icon: IdCard },
  { key: 'academico', label: 'Informações Acadêmicas', Icon: GraduationCap },
  { key: 'saude', label: 'Informações de Saúde', Icon: HeartPulse },
  { key: 'medicacao', label: 'Medicação', Icon: Pill },
  { key: 'queixas', label: 'Queixas e Sintomas', Icon: MessageSquareWarning },
  { key: 'rotina', label: 'Rotina e Atividades', Icon: ClipboardList },
  { key: 'agendamento', label: 'Agendamento / Recebimento', Icon: CalendarDays },
  { key: 'registro', label: 'Registro Documental', Icon: FolderOpen },
  { key: 'sessoes', label: 'Histórico de Sessões', Icon: History },
  { key: 'evolucao', label: 'Evolução Periódica', Icon: TrendingUp },
  { key: 'documento', label: 'Gerar Documento / Laudo', Icon: FileText },
  { key: 'notas', label: 'Anotação Avulsa', Icon: Pin },
];

export function PatientTabsNav({ active }: { active: PatientTabKey }) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const buildHref = (key: PatientTabKey) => {
    const params = new URLSearchParams(sp);
    if (key === 'info') params.delete('tab');
    else params.set('tab', key);
    return `${pathname}${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto rounded-lg border bg-card p-2 lg:flex-col lg:overflow-visible lg:p-3">
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <Link
            key={t.key}
            href={buildHref(t.key)}
            className={cn(
              'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:bg-accent hover:text-foreground',
            )}
          >
            <t.Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
