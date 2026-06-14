'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePatientExtendedAction } from '@/modules/pacientes/actions/update-patient-extended';
import { formatDate } from '@/lib/utils/dates';
import type { Patient, DadosQueixas, OutraQueixa, AnaliseSintomas, Sintoma } from '@/types/domain';

const uid = () => crypto.randomUUID();

const INTENSIDADES = ['0','1','2','3','4','5','6','7','8','9','10'] as const;

export function QueixasTab({ patient }: { patient: Patient }) {
  const dq = patient.dadosQueixas ?? {};
  const [data, setData] = useState<DadosQueixas>({
    queixasIniciais: dq.queixasIniciais ?? '',
    outrasQueixas: dq.outrasQueixas ?? [],
    analises: dq.analises ?? [],
  });
  const [saving, setSaving] = useState(false);

  // ── Queixas Iniciais ──────────────────────────────
  const [editandoIniciais, setEditandoIniciais] = useState(false);
  const [rascunhoIniciais, setRascunhoIniciais] = useState('');

  // ── Outras Queixas ────────────────────────────────
  const [novaQueixaAberta, setNovaQueixaAberta] = useState(false);
  const [novaQueixa, setNovaQueixa] = useState<{ data: string; texto: string }>({ data: '', texto: '' });
  const [editandoQueixa, setEditandoQueixa] = useState<string | null>(null);
  const [rascunhoQueixa, setRascunhoQueixa] = useState<OutraQueixa | null>(null);

  // ── Análise de Sintomas ───────────────────────────
  const [novaAnaliseAberta, setNovaAnaliseAberta] = useState(false);
  const [novaPeriodo, setNovaPeriodo] = useState('');
  const [analisesAbertas, setAnalisesAbertas] = useState<Set<string>>(new Set());
  const [novoSintoma, setNovoSintoma] = useState<Record<string, Partial<Sintoma>>>({});

  const save = async (updated: DadosQueixas) => {
    setSaving(true);
    const result = await updatePatientExtendedAction(patient.id, { dadosQueixas: updated });
    setSaving(false);
    if (!result.ok) toast.error(result.error ?? 'Erro ao salvar.');
    return result.ok;
  };

  // ── handlers queixas iniciais ──
  const salvarIniciais = async () => {
    const updated = { ...data, queixasIniciais: rascunhoIniciais };
    if (await save(updated)) { setData(updated); setEditandoIniciais(false); toast.success('Queixas iniciais salvas.'); }
  };

  // ── handlers outras queixas ──
  const adicionarQueixa = async () => {
    if (!novaQueixa.texto.trim()) { toast.error('Descreva a queixa.'); return; }
    const item: OutraQueixa = { id: uid(), data: novaQueixa.data, texto: novaQueixa.texto };
    const updated = { ...data, outrasQueixas: [...(data.outrasQueixas ?? []), item] };
    if (await save(updated)) { setData(updated); setNovaQueixa({ data: '', texto: '' }); setNovaQueixaAberta(false); toast.success('Queixa adicionada.'); }
  };

  const salvarEdicaoQueixa = async () => {
    if (!rascunhoQueixa) return;
    const updated = { ...data, outrasQueixas: (data.outrasQueixas ?? []).map((q) => q.id === rascunhoQueixa.id ? rascunhoQueixa : q) };
    if (await save(updated)) { setData(updated); setEditandoQueixa(null); toast.success('Queixa atualizada.'); }
  };

  const removerQueixa = async (id: string) => {
    const updated = { ...data, outrasQueixas: (data.outrasQueixas ?? []).filter((q) => q.id !== id) };
    if (await save(updated)) { setData(updated); toast.success('Queixa removida.'); }
  };

  // ── handlers análise de sintomas ──
  const adicionarAnalise = async () => {
    if (!novaPeriodo.trim()) { toast.error('Informe o período.'); return; }
    const item: AnaliseSintomas = { id: uid(), periodo: novaPeriodo, sintomas: [] };
    const updated = { ...data, analises: [...(data.analises ?? []), item] };
    if (await save(updated)) {
      setData(updated);
      setNovaPeriodo('');
      setNovaAnaliseAberta(false);
      setAnalisesAbertas((prev) => new Set([...prev, item.id]));
      toast.success('Análise criada.');
    }
  };

  const removerAnalise = async (id: string) => {
    const updated = { ...data, analises: (data.analises ?? []).filter((a) => a.id !== id) };
    if (await save(updated)) { setData(updated); toast.success('Análise removida.'); }
  };

  const adicionarSintoma = async (analiseId: string) => {
    const draft = novoSintoma[analiseId];
    if (!draft?.nome?.trim()) { toast.error('Informe o nome do sintoma.'); return; }
    const sintoma: Sintoma = { id: uid(), nome: draft.nome, inicio: draft.inicio, situacao: draft.situacao, frequencia: draft.frequencia, intensidade: draft.intensidade, observacoes: draft.observacoes, statusFinal: draft.statusFinal };
    const updated = { ...data, analises: (data.analises ?? []).map((a) => a.id === analiseId ? { ...a, sintomas: [...a.sintomas, sintoma] } : a) };
    if (await save(updated)) { setData(updated); setNovoSintoma((prev) => ({ ...prev, [analiseId]: {} })); toast.success('Sintoma adicionado.'); }
  };

  const removerSintoma = async (analiseId: string, sintomaId: string) => {
    const updated = { ...data, analises: (data.analises ?? []).map((a) => a.id === analiseId ? { ...a, sintomas: a.sintomas.filter((s) => s.id !== sintomaId) } : a) };
    if (await save(updated)) { setData(updated); }
  };

  const toggleAnalise = (id: string) => {
    setAnalisesAbertas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">

      {/* ══ QUEIXAS INICIAIS ══ */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <CardTitle className="text-lg">Queixas e Sintomas</CardTitle>
          {!editandoIniciais ? (
            <Button variant="outline" size="sm" onClick={() => { setRascunhoIniciais(data.queixasIniciais ?? ''); setEditandoIniciais(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={salvarIniciais} disabled={saving}><Check className="mr-1.5 h-4 w-4" /> Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditandoIniciais(false)}><X className="mr-1.5 h-4 w-4" /> Cancelar</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Queixas iniciais</Label>
          {editandoIniciais ? (
            <textarea
              rows={5}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={rascunhoIniciais}
              onChange={(e) => setRascunhoIniciais(e.target.value)}
              placeholder="Descreva as queixas iniciais do cliente..."
            />
          ) : (
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm min-h-[80px]">
              {data.queixasIniciais || <span className="text-muted-foreground">Nenhuma queixa registrada.</span>}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ══ OUTRAS QUEIXAS ══ */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Outras Queixas</CardTitle>
            <p className="text-sm text-muted-foreground">Registros de queixas com data de ocorrência.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setNovaQueixaAberta(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">

          {novaQueixaAberta ? (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
              <p className="text-sm font-medium">Nova queixa</p>
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input type="date" value={novaQueixa.data} onChange={(e) => setNovaQueixa((q) => ({ ...q, data: e.target.value }))} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição da queixa</Label>
                <textarea
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={novaQueixa.texto}
                  onChange={(e) => setNovaQueixa((q) => ({ ...q, texto: e.target.value }))}
                  placeholder="Descreva a queixa..."
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarQueixa} disabled={saving}>Salvar</Button>
                <Button size="sm" variant="ghost" onClick={() => { setNovaQueixaAberta(false); setNovaQueixa({ data: '', texto: '' }); }}>Cancelar</Button>
              </div>
            </div>
          ) : null}

          {(data.outrasQueixas ?? []).length === 0 && !novaQueixaAberta ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma queixa adicional registrada.</p>
          ) : null}

          {(data.outrasQueixas ?? []).map((q) => (
            <div key={q.id} className="rounded-lg border p-4 space-y-2">
              {editandoQueixa === q.id && rascunhoQueixa ? (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Data</Label>
                    <Input type="date" value={rascunhoQueixa.data} onChange={(e) => setRascunhoQueixa({ ...rascunhoQueixa, data: e.target.value })} className="w-40" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <textarea rows={4} className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={rascunhoQueixa.texto} onChange={(e) => setRascunhoQueixa({ ...rascunhoQueixa, texto: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={salvarEdicaoQueixa} disabled={saving}>Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditandoQueixa(null)}>Cancelar</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    {q.data ? (
                      <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-2 py-0.5">
                        Data: {formatDate(q.data)}
                      </span>
                    ) : <span />}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditandoQueixa(q.id); setRascunhoQueixa(q); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removerQueixa(q.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{q.texto}</p>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ══ ANÁLISE DE SINTOMAS ══ */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Análise de Sintomas</CardTitle>
            <p className="text-sm text-muted-foreground">Acompanhamento de sintomas por período.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setNovaAnaliseAberta(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo período
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">

          {novaAnaliseAberta ? (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
              <Label className="text-xs">Período (ex.: Outubro 2025)</Label>
              <Input value={novaPeriodo} onChange={(e) => setNovaPeriodo(e.target.value)} placeholder="Ex.: Novembro 2025" className="max-w-xs" />
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarAnalise} disabled={saving}>Criar</Button>
                <Button size="sm" variant="ghost" onClick={() => { setNovaAnaliseAberta(false); setNovaPeriodo(''); }}>Cancelar</Button>
              </div>
            </div>
          ) : null}

          {(data.analises ?? []).length === 0 && !novaAnaliseAberta ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma análise de sintomas registrada.</p>
          ) : null}

          {(data.analises ?? []).map((analise) => {
            const aberta = analisesAbertas.has(analise.id);
            const draft = novoSintoma[analise.id] ?? {};
            const setDraft = (field: keyof Sintoma, val: string) =>
              setNovoSintoma((prev) => ({ ...prev, [analise.id]: { ...prev[analise.id], [field]: val } }));

            return (
              <div key={analise.id} className="rounded-lg border overflow-hidden">
                {/* cabeçalho do período */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                  onClick={() => toggleAnalise(analise.id)}
                >
                  <span className="font-semibold text-sm">ANÁLISE DE SINTOMAS — {analise.periodo.toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => { e.stopPropagation(); removerAnalise(analise.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    {aberta ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {aberta ? (
                  <div className="p-4 space-y-4">
                    {/* Tabela de sintomas */}
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left min-w-[140px]">Sintomas</th>
                            <th className="px-3 py-2 text-left min-w-[100px]">Início</th>
                            <th className="px-3 py-2 text-left min-w-[160px]">Situação</th>
                            <th className="px-3 py-2 text-left min-w-[100px]">Frequência</th>
                            <th className="px-3 py-2 text-center min-w-[80px]">Intens. (0-10)</th>
                            <th className="px-3 py-2 text-left min-w-[160px]">Observações</th>
                            <th className="px-3 py-2 text-left min-w-[160px]">Status final</th>
                            <th className="px-3 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {analise.sintomas.map((s) => (
                            <tr key={s.id} className="hover:bg-muted/10">
                              <td className="px-3 py-2 font-medium">{s.nome}</td>
                              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                                {s.inicio ? formatDate(s.inicio) : '—'}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{s.situacao || '—'}</td>
                              <td className="px-3 py-2 text-muted-foreground">{s.frequencia || '—'}</td>
                              <td className="px-3 py-2 text-center">
                                {s.intensidade ? (
                                  <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-xs">{s.intensidade}</span>
                                ) : '—'}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{s.observacoes || '—'}</td>
                              <td className="px-3 py-2 text-muted-foreground">{s.statusFinal || '—'}</td>
                              <td className="px-3 py-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removerSintoma(analise.id, s.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}

                          {/* Linha de novo sintoma */}
                          <tr className="bg-muted/10">
                            <td className="px-3 py-2">
                              <Input className="h-7 text-sm" placeholder="Nome do sintoma" value={draft.nome ?? ''} onChange={(e) => setDraft('nome', e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <Input type="date" className="h-7 text-sm w-36" value={draft.inicio ?? ''} onChange={(e) => setDraft('inicio', e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <Input className="h-7 text-sm" placeholder="Situação" value={draft.situacao ?? ''} onChange={(e) => setDraft('situacao', e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <Input className="h-7 text-sm" placeholder="Ex.: Diário" value={draft.frequencia ?? ''} onChange={(e) => setDraft('frequencia', e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <select className="h-7 w-16 rounded-md border border-input bg-background px-2 text-sm" value={draft.intensidade ?? ''} onChange={(e) => setDraft('intensidade', e.target.value)}>
                                <option value="">—</option>
                                {INTENSIDADES.map((i) => <option key={i} value={i}>{i}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <Input className="h-7 text-sm" placeholder="Observações" value={draft.observacoes ?? ''} onChange={(e) => setDraft('observacoes', e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <Input className="h-7 text-sm" placeholder="Status final" value={draft.statusFinal ?? ''} onChange={(e) => setDraft('statusFinal', e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <Button size="icon" className="h-7 w-7" onClick={() => adicionarSintoma(analise.id)} disabled={saving}>
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
