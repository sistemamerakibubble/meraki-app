import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      <Card>
        <CardHeader className="items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Construction className="h-7 w-7" aria-hidden />
          </div>
          <CardTitle className="text-xl">Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Este módulo está no roadmap. Consulte <code className="font-mono">docs/roadmap.md</code>{' '}
          para ver a fase em que será entregue.
        </CardContent>
      </Card>
    </div>
  );
}
