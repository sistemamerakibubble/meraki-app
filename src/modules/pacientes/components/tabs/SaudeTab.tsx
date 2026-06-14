'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updatePatientExtendedAction } from '@/modules/pacientes/actions/update-patient-extended';
import type { Patient, DadosSaude } from '@/types/domain';

const areaClass = 'flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

export function SaudeTab({ patient }: { patient: Patient }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const ds = patient.dadosSaude ?? {};
  const [form, setForm] = useState<DadosSaude>({
    diagnosticos: ds.diagnosticos ?? '',
    tratamentosAtuais: ds.tratamentosAtuais ?? '',
    atualizacoesTratamentos: ds.atualizacoesTratamentos ?? '',
    sono: ds.sono ?? '',
  });

  const set = (key: keyof DadosSaude) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    await updatePatientExtendedAction(patient.id, { dadosSaude: form });
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setForm({
      diagnosticos: ds.diagnosticos ?? '',
      tratamentosAtuais: ds.tratamentosAtuais ?? '',
      atualizacoesTratamentos: ds.atualizacoesTratamentos ?? '',
      sono: ds.sono ?? '',
    });
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Informações de Saúde</CardTitle>
          <p className="text-sm text-muted-foreground">Diagnósticos, tratamentos e padrão de sono.</p>
        </div>
        {!editing ? (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              <Check className="mr-2 h-4 w-4" /> Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel} disabled={saving}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <TextArea
          label="Diagnósticos"
          value={form.diagnosticos ?? ''}
          dbValue={ds.diagnosticos}
          editing={editing}
          onChange={set('diagnosticos')}
          placeholder="Liste os diagnósticos do cliente (CID, DSM etc.)..."
        />
        <TextArea
          label="Tratamentos atuais"
          value={form.tratamentosAtuais ?? ''}
          dbValue={ds.tratamentosAtuais}
          editing={editing}
          onChange={set('tratamentosAtuais')}
          placeholder="Descreva os tratamentos em andamento..."
        />
        <TextArea
          label="Atualizações de tratamentos"
          value={form.atualizacoesTratamentos ?? ''}
          dbValue={ds.atualizacoesTratamentos}
          editing={editing}
          onChange={set('atualizacoesTratamentos')}
          placeholder="Registre mudanças recentes nos tratamentos..."
        />
        <TextArea
          label="Sono"
          value={form.sono ?? ''}
          dbValue={ds.sono}
          editing={editing}
          onChange={set('sono')}
          placeholder="Descreva o padrão de sono (horários, qualidade, dificuldades)..."
        />
      </CardContent>
    </Card>
  );
}

function TextArea({
  label,
  value,
  dbValue,
  editing,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  dbValue?: string;
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">{label}</Label>
      {editing ? (
        <textarea rows={4} className={areaClass} value={value} onChange={onChange} placeholder={placeholder} />
      ) : (
        <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm min-h-[80px]">
          {dbValue || <span className="text-muted-foreground">Nenhum registro.</span>}
        </p>
      )}
    </div>
  );
}
