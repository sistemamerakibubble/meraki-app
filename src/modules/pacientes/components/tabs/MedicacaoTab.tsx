'use client';

import { useState } from 'react';
import { Plus, Trash2, Pill } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePatientExtendedAction } from '@/modules/pacientes/actions/update-patient-extended';
import { formatDate } from '@/lib/utils/dates';
import type { Patient, Medicamento } from '@/types/domain';

const empty = (): Medicamento => ({ nome: '', dosagem: '', inicio: '', alteracao: '' });

export function MedicacaoTab({ patient }: { patient: Patient }) {
  const [meds, setMeds] = useState<Medicamento[]>(patient.medicamentos ?? []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Medicamento>(empty());
  const [saving, setSaving] = useState(false);

  const setDraftField = (key: keyof Medicamento) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const addMed = async () => {
    if (!draft.nome.trim()) { toast.error('Nome do medicamento é obrigatório.'); return; }
    const updated = [...meds, draft];
    setSaving(true);
    const result = await updatePatientExtendedAction(patient.id, { medicamentos: updated });
    setSaving(false);
    if (result.ok) {
      setMeds(updated);
      setDraft(empty());
      setAdding(false);
      toast.success('Medicamento adicionado.');
    } else {
      toast.error(result.error ?? 'Erro ao salvar.');
    }
  };

  const removeMed = async (idx: number) => {
    const updated = meds.filter((_, i) => i !== idx);
    setSaving(true);
    const result = await updatePatientExtendedAction(patient.id, { medicamentos: updated });
    setSaving(false);
    if (result.ok) { setMeds(updated); toast.success('Medicamento removido.'); }
    else toast.error(result.error ?? 'Erro ao remover.');
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Medicação</CardTitle>
          <p className="text-sm text-muted-foreground">Medicamentos em uso com dosagem e datas.</p>
        </div>
        <Button variant="outline" onClick={() => { setAdding(true); setDraft(empty()); }}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {meds.length === 0 && !adding ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Pill className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum medicamento registrado.</p>
            <Button variant="outline" className="mt-3" onClick={() => setAdding(true)}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar medicamento
            </Button>
          </div>
        ) : null}

        {meds.map((m, i) => (
          <div key={i} className="rounded-lg border bg-muted/20 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="font-medium text-sm">{m.nome}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeMed(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
              {m.dosagem ? <><dt className="text-xs text-muted-foreground">Dosagem</dt><dd>{m.dosagem}</dd></> : null}
              {m.inicio ? <><dt className="text-xs text-muted-foreground">Início</dt><dd>{formatDate(m.inicio)}</dd></> : null}
              {m.alteracao ? <div className="col-span-2 sm:col-span-3 mt-1">
                <p className="text-xs text-muted-foreground">Alteração</p>
                <p className="whitespace-pre-wrap">{m.alteracao}</p>
              </div> : null}
            </dl>
          </div>
        ))}

        {adding ? (
          <div className="rounded-lg border p-4 space-y-4">
            <p className="text-sm font-medium">Novo medicamento</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Nome do medicamento *</Label>
                <Input value={draft.nome} onChange={setDraftField('nome')} placeholder="Ex.: Ritalina" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dosagem</Label>
                <Input value={draft.dosagem} onChange={setDraftField('dosagem')} placeholder="Ex.: 10mg — 2x ao dia" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data de início</Label>
                <Input type="date" value={draft.inicio} onChange={setDraftField('inicio')} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Alteração / observação</Label>
                <textarea
                  rows={2}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={draft.alteracao}
                  onChange={setDraftField('alteracao')}
                  placeholder="Registre alterações de dose, suspensão, etc."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addMed} disabled={saving}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} disabled={saving}>Cancelar</Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
