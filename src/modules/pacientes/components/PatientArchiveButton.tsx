'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { archivePatientAction } from '@/modules/pacientes/actions/archive-patient';
import { routes } from '@/lib/constants/routes';

export function PatientArchiveButton({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onClick = () => {
    if (!confirm('Arquivar este paciente? Ele não aparecerá mais na lista padrão.')) return;
    startTransition(async () => {
      const r = await archivePatientAction(patientId);
      if (r.ok) {
        toast.success('Paciente arquivado.');
        router.push(routes.pacientes);
      } else {
        toast.error(r.error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={pending}
      className="text-destructive hover:text-destructive"
    >
      <Archive className="mr-2 h-4 w-4" aria-hidden />
      Arquivar
    </Button>
  );
}
