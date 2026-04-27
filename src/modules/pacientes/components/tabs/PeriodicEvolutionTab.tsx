'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EvolutionForm } from '@/modules/pacientes/components/tabs/EvolutionForm';
import { deleteEvolutionAction } from '@/modules/pacientes/actions/evolution';
import { formatDate } from '@/lib/utils/dates';
import type { PatientEvolution, Role } from '@/types/domain';

export function PeriodicEvolutionTab({
  patientId,
  evolutions,
  role,
}: {
  patientId: string;
  evolutions: PatientEvolution[];
  role: Role;
}) {
  const [opened, setOpened] = useState<PatientEvolution | null>(null);
  const [editing, setEditing] = useState<PatientEvolution | null>(null);
  const [pending, startTransition] = useTransition();

  const canCreate = role === 'admin' || role === 'medico';

  const remove = (e: PatientEvolution) => {
    if (!confirm('Excluir esta evolução? A ação não pode ser desfeita.')) return;
    startTransition(async () => {
      const r = await deleteEvolutionAction(e.id, patientId);
      if (r.ok) toast.success('Evolução excluída.');
      else toast.error(r.error);
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Evolução periódica</CardTitle>
            <p className="text-sm text-muted-foreground">
              Resumos clínicos do tratamento ao longo do tempo.
            </p>
          </div>
          {canCreate ? (
            <EvolutionForm
              mode={{ kind: 'create', patientId }}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" aria-hidden /> Nova evolução
                </Button>
              }
            />
          ) : null}
        </CardHeader>
        <CardContent>
          {evolutions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma evolução registrada ainda.
            </p>
          ) : (
            <ul className="divide-y">
              {evolutions.map((e) => {
                const canModify = canCreate;
                return (
                  <li key={e.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="truncate font-medium">{e.title}</h3>
                        <time className="text-xs text-muted-foreground" dateTime={e.createdAt}>
                          {formatDate(e.createdAt)} · {e.authorName ?? 'Profissional'}
                        </time>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {e.summary}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setOpened(e)}>
                        Ver completo
                      </Button>
                      {canModify ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditing(e)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={pending}
                            onClick={() => remove(e)}
                            aria-label="Excluir"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!opened} onOpenChange={(next) => !next && setOpened(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{opened?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {opened
                ? `${formatDate(opened.createdAt)} · ${opened.authorName ?? 'Profissional'}`
                : ''}
            </p>
          </DialogHeader>
          {opened ? (
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm">
              {opened.content}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {editing ? (
        <EvolutionForm
          mode={{ kind: 'edit', evolution: editing }}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}
