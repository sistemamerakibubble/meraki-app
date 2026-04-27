import Link from 'next/link';
import { BookOpen, MessageCircle, LifeBuoy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function HelpPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <BookOpen className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle className="text-base">Documentação</CardTitle>
          <CardDescription>Guia rápido e visão geral dos módulos.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Consulte os <code className="font-mono">README.md</code> de cada pasta em{' '}
          <code className="font-mono">src/modules/*</code> para detalhes técnicos.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle className="text-base">Suporte</CardTitle>
          <CardDescription>
            Dúvidas ou problemas? Entre em contato com a equipe de implantação.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <Link
            href="mailto:suporte@meraki.dev"
            className="text-primary hover:underline"
          >
            suporte@meraki.dev
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <LifeBuoy className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle className="text-base">Primeiros passos</CardTitle>
          <CardDescription>Como começar a usar o Meraki.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="ml-4 list-decimal space-y-1">
            <li>Cadastre os profissionais na aba Equipe.</li>
            <li>Importe seus pacientes.</li>
            <li>Configure salas e horários na Agenda.</li>
            <li>Ative os lembretes de consulta.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
