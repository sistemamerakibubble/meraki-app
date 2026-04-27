'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createPatientNoteAction,
  deletePatientNoteAction,
  updatePatientNoteAction,
  type CreatePatientNoteResult,
  type UpdatePatientNoteResult,
} from '@/modules/pacientes/actions/patient-note';
import { formatDateTime } from '@/lib/utils/dates';
import type { PatientNote } from '@/types/domain';

export function PatientNotesTab({
  patientId,
  notes,
}: {
  patientId: string;
  notes: PatientNote[];
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction, pending] = useActionState<
    CreatePatientNoteResult | null,
    FormData
  >(createPatientNoteAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success('Anotação salva.');
      if (inputRef.current) inputRef.current.value = '';
    } else if (state && !state.ok && state.error.formError) {
      toast.error(state.error.formError);
    }
  }, [state]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const content = inputRef.current?.value.trim() ?? '';
    if (!content) return;
    const fd = new FormData();
    fd.set('patientId', patientId);
    fd.set('content', content);
    startTransition(() => formAction(fd));
  };

  const [editing, setEditing] = useState<PatientNote | null>(null);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anotação avulsa</CardTitle>
          <p className="text-sm text-muted-foreground">
            Notas rápidas sobre o paciente (paciente ligou, recados de família, etc).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <textarea
              ref={inputRef}
              rows={3}
              maxLength={2000}
              disabled={pending}
              placeholder="Digite aqui uma anotação rápida..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? 'Salvando...' : 'Salvar nota'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anotações registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nenhuma anotação ainda.</p>
          ) : (
            <ul className="divide-y">
              {notes.map((n) => (
                <NoteRow
                  key={n.id}
                  note={n}
                  patientId={patientId}
                  onEdit={() => setEditing(n)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <EditNoteDialog
          note={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function NoteRow({
  note,
  patientId,
  onEdit,
}: {
  note: PatientNote;
  patientId: string;
  onEdit: () => void;
}) {
  const [pending, startTransitionLocal] = useState(false);

  const remove = () => {
    if (!confirm('Excluir esta anotação?')) return;
    startTransitionLocal(true);
    deletePatientNoteAction(note.id, patientId)
      .then((r) => {
        if (r.ok) toast.success('Anotação excluída.');
        else toast.error(r.error);
      })
      .finally(() => startTransitionLocal(false));
  };

  return (
    <li className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap text-sm">{note.content}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {note.authorName ?? 'Profissional'} · {formatDateTime(note.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={remove}
          disabled={pending}
          aria-label="Excluir"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

function EditNoteDialog({
  note,
  onClose,
}: {
  note: PatientNote;
  onClose: () => void;
}) {
  const [content, setContent] = useState(note.content);
  const [state, formAction, pending] = useActionState<
    UpdatePatientNoteResult | null,
    FormData
  >((prev, fd) => updatePatientNoteAction(note.id, prev, fd), null);

  useEffect(() => {
    if (state?.ok) {
      toast.success('Anotação atualizada.');
      onClose();
    }
  }, [state, onClose]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set('patientId', note.patientId);
    fd.set('content', content.trim());
    startTransition(() => formAction(fd));
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar anotação</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={2000}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {state && !state.ok && state.error.formError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {state.error.formError}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !content.trim()}>
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
