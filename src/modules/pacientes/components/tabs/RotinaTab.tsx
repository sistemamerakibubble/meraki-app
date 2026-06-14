'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updatePatientExtendedAction } from '@/modules/pacientes/actions/update-patient-extended';
import type { Patient, RotinaItem } from '@/types/domain';

const DIAS: { key: keyof RotinaItem; label: string }[] = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export function RotinaTab({ patient }: { patient: Patient }) {
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);

  const [atividades, setAtividades] = useState(patient.atividades ?? '');
  const [rotina, setRotina] = useState<RotinaItem>(patient.rotina ?? {});

  const [rascunhoAtividades, setRascunhoAtividades] = useState('');
  const [rascunhoRotina, setRascunhoRotina] = useState<RotinaItem>({});

  const iniciarEdicao = () => {
    setRascunhoAtividades(atividades);
    setRascunhoRotina({ ...rotina });
    setEditando(true);
  };

  const salvar = async () => {
    setSaving(true);
    const result = await updatePatientExtendedAction(patient.id, {
      atividades: rascunhoAtividades,
      rotina: rascunhoRotina,
    });
    setSaving(false);
    if (result.ok) {
      setAtividades(rascunhoAtividades);
      setRotina(rascunhoRotina);
      setEditando(false);
      toast.success('Rotina salva.');
    } else {
      toast.error(result.error ?? 'Erro ao salvar.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <CardTitle className="text-lg">Rotina e Atividades</CardTitle>
          {!editando ? (
            <Button variant="outline" size="sm" onClick={iniciarEdicao}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={salvar} disabled={saving}>
                <Check className="mr-1.5 h-4 w-4" /> Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>
                <X className="mr-1.5 h-4 w-4" /> Cancelar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Atividades gerais */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Atividades e interesses
            </Label>
            {editando ? (
              <textarea
                rows={4}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={rascunhoAtividades}
                onChange={(e) => setRascunhoAtividades(e.target.value)}
                placeholder="Descreva atividades extracurriculares, hobbies, esportes, etc."
              />
            ) : (
              <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm min-h-[80px]">
                {atividades || <span className="text-muted-foreground">Nenhuma atividade registrada.</span>}
              </p>
            )}
          </div>

          {/* Rotina semanal */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Rotina semanal
            </Label>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left w-36">Dia</th>
                    <th className="px-4 py-2 text-left">Atividades do dia</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {DIAS.map(({ key, label }) => (
                    <tr key={key} className="hover:bg-muted/10">
                      <td className="px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">
                        {label}
                      </td>
                      <td className="px-4 py-2">
                        {editando ? (
                          <input
                            type="text"
                            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                            value={rascunhoRotina[key] ?? ''}
                            onChange={(e) =>
                              setRascunhoRotina((r) => ({ ...r, [key]: e.target.value }))
                            }
                            placeholder={`Atividades de ${label.toLowerCase()}...`}
                          />
                        ) : (
                          <span className={rotina[key] ? '' : 'text-muted-foreground'}>
                            {rotina[key] || '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
