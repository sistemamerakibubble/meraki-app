'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePatientExtendedAction } from '@/modules/pacientes/actions/update-patient-extended';
import type { Patient, DadosAcademicos } from '@/types/domain';

const TIPO_ESCOLA = ['Pública', 'Particular', 'Filantrópica'] as const;
const TURNOS = ['Manhã', 'Tarde', 'Noite', 'Integral'] as const;

export function AcademicoTab({ patient }: { patient: Patient }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const da = patient.dadosAcademicos ?? {};
  const [form, setForm] = useState<DadosAcademicos>({
    escola: da.escola ?? '',
    endereco: da.endereco ?? '',
    telefone: da.telefone ?? '',
    desde: da.desde ?? '',
    turma: da.turma ?? '',
    turno: da.turno ?? '',
    tipoEscola: da.tipoEscola ?? '',
    email: da.email ?? '',
    reprovas: da.reprovas ?? '',
    coordenador: da.coordenador ?? '',
    orientador: da.orientador ?? '',
    mediador: da.mediador ?? '',
    historico: da.historico ?? '',
    empresa: da.empresa ?? '',
    enderecoEmpresa: da.enderecoEmpresa ?? '',
    telefoneEmpresa: da.telefoneEmpresa ?? '',
    cargo: da.cargo ?? '',
    horarioTrabalho: da.horarioTrabalho ?? '',
    renda: da.renda ?? '',
    tempoCargo: da.tempoCargo ?? '',
    historicoProfissional: da.historicoProfissional ?? '',
  });

  const set = (key: keyof DadosAcademicos) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    await updatePatientExtendedAction(patient.id, { dadosAcademicos: form });
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => {
    setForm({
      escola: da.escola ?? '',
      endereco: da.endereco ?? '',
      telefone: da.telefone ?? '',
      desde: da.desde ?? '',
      turma: da.turma ?? '',
      turno: da.turno ?? '',
      tipoEscola: da.tipoEscola ?? '',
      email: da.email ?? '',
      reprovas: da.reprovas ?? '',
      coordenador: da.coordenador ?? '',
      orientador: da.orientador ?? '',
      mediador: da.mediador ?? '',
      historico: da.historico ?? '',
      empresa: da.empresa ?? '',
      enderecoEmpresa: da.enderecoEmpresa ?? '',
      telefoneEmpresa: da.telefoneEmpresa ?? '',
      cargo: da.cargo ?? '',
      horarioTrabalho: da.horarioTrabalho ?? '',
      renda: da.renda ?? '',
      tempoCargo: da.tempoCargo ?? '',
      historicoProfissional: da.historicoProfissional ?? '',
    });
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Informações Acadêmicas e Profissionais</CardTitle>
          <p className="text-sm text-muted-foreground">Escola, turma, histórico escolar e dados profissionais.</p>
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
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Dados da escola</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da escola">
              {editing ? <Input value={form.escola} onChange={set('escola')} /> : <Value>{da.escola}</Value>}
            </Field>
            <Field label="Telefone">
              {editing ? <Input value={form.telefone} onChange={set('telefone')} placeholder="(11) 99999-9999" /> : <Value>{da.telefone}</Value>}
            </Field>
            <Field label="Tipo de escola">
              {editing ? (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.tipoEscola}
                  onChange={set('tipoEscola')}
                >
                  <option value="">Selecione</option>
                  {TIPO_ESCOLA.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : <Value>{da.tipoEscola}</Value>}
            </Field>
            <Field label="Turno">
              {editing ? (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.turno}
                  onChange={set('turno')}
                >
                  <option value="">Selecione</option>
                  {TURNOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : <Value>{da.turno}</Value>}
            </Field>
            <Field label="Turma / Série">
              {editing ? <Input value={form.turma} onChange={set('turma')} /> : <Value>{da.turma}</Value>}
            </Field>
            <Field label="Estudando desde">
              {editing ? <Input type="date" value={form.desde} onChange={set('desde')} /> : <Value>{da.desde ? da.desde.slice(0, 7) : undefined}</Value>}
            </Field>
            <div className="sm:col-span-2">
              <Field label="Endereço da escola">
                {editing ? <Input value={form.endereco} onChange={set('endereco')} /> : <Value>{da.endereco}</Value>}
              </Field>
            </div>
            <Field label="E-mail da escola">
              {editing ? <Input type="email" value={form.email} onChange={set('email')} /> : <Value>{da.email}</Value>}
            </Field>
            <Field label="Reprovas">
              {editing ? <Input value={form.reprovas} onChange={set('reprovas')} placeholder="Ex.: 2019 - 3º ano" /> : <Value>{da.reprovas}</Value>}
            </Field>
            <Field label="Coordenador(a)">
              {editing ? <Input value={form.coordenador} onChange={set('coordenador')} /> : <Value>{da.coordenador}</Value>}
            </Field>
            <Field label="Orientador(a)">
              {editing ? <Input value={form.orientador} onChange={set('orientador')} /> : <Value>{da.orientador}</Value>}
            </Field>
            <Field label="Mediador(a)">
              {editing ? <Input value={form.mediador} onChange={set('mediador')} /> : <Value>{da.mediador}</Value>}
            </Field>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Histórico acadêmico</p>
          {editing ? (
            <textarea
              rows={5}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.historico}
              onChange={set('historico')}
              placeholder="Descreva o histórico escolar do cliente..."
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm min-h-[80px]">
              {da.historico || <span className="text-muted-foreground">Nenhum histórico registrado.</span>}
            </p>
          )}
        </section>

        {/* ── Informações Profissionais ── */}
        <div className="border-t pt-6 space-y-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Informações Profissionais</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Empresa / Local de trabalho">
              {editing ? <Input value={form.empresa} onChange={set('empresa')} /> : <Value>{da.empresa}</Value>}
            </Field>
            <Field label="Cargo / Função">
              {editing ? <Input value={form.cargo} onChange={set('cargo')} /> : <Value>{da.cargo}</Value>}
            </Field>
            <Field label="Telefone da empresa">
              {editing ? <Input value={form.telefoneEmpresa} onChange={set('telefoneEmpresa')} placeholder="(11) 99999-9999" /> : <Value>{da.telefoneEmpresa}</Value>}
            </Field>
            <Field label="Há quanto tempo no cargo">
              {editing ? <Input value={form.tempoCargo} onChange={set('tempoCargo')} placeholder="Ex.: 2 anos" /> : <Value>{da.tempoCargo}</Value>}
            </Field>
            <Field label="Horário de trabalho">
              {editing ? <Input value={form.horarioTrabalho} onChange={set('horarioTrabalho')} placeholder="Ex.: Seg a Sex — 08h às 17h" /> : <Value>{da.horarioTrabalho}</Value>}
            </Field>
            <Field label="Renda">
              {editing ? <Input value={form.renda} onChange={set('renda')} placeholder="Ex.: R$ 3.500,00" /> : <Value>{da.renda}</Value>}
            </Field>
            <div className="sm:col-span-2">
              <Field label="Endereço da empresa">
                {editing ? <Input value={form.enderecoEmpresa} onChange={set('enderecoEmpresa')} /> : <Value>{da.enderecoEmpresa}</Value>}
              </Field>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Histórico profissional</p>
          {editing ? (
            <textarea
              rows={4}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.historicoProfissional}
              onChange={set('historicoProfissional')}
              placeholder="Descreva o histórico de empregos, áreas de atuação, cursos relevantes..."
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm min-h-[60px]">
              {da.historicoProfissional || <span className="text-muted-foreground">Nenhum histórico registrado.</span>}
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Value({ children }: { children?: string | null }) {
  return <p className="text-sm py-2">{children || <span className="text-muted-foreground">—</span>}</p>;
}
