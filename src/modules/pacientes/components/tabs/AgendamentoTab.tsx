'use client';

import { useState, useMemo } from 'react';
import { Pencil, Check, X, Plus, CalendarDays, DollarSign, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BillingStatusBadge } from '@/modules/financeiro/components/BillingStatusBadge';
import { formatDate } from '@/lib/utils/dates';
import { formatBRL, brlToCents } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/constants/routes';
import { updatePatientExtendedAction } from '@/modules/pacientes/actions/update-patient-extended';
import type { Billing, Patient } from '@/types/domain';
import type { PatientAppointmentItem } from '@/modules/pacientes/queries/listPatientAppointments';

const PAYMENT_METHODS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Boleto', 'Dinheiro', 'Transferência'] as const;

type RecebimentoConfig = {
  formaPagamento: string;
  dataFechamento: string;
  valorPackageCents: number | null;
  valorSessaoExtraCents: number | null;
};

function parseBRL(str: string): number | null {
  if (!str) return null;
  try { return brlToCents(str); } catch { return null; }
}

export function AgendamentoTab({
  patient,
  appointments,
  billings,
}: {
  patient: Patient;
  appointments: PatientAppointmentItem[];
  billings: Billing[];
}) {
  // ── Filtro de agendamentos ──────────────────────────
  const [apptFrom, setApptFrom] = useState('');
  const [apptTo, setApptTo] = useState('');

  // ── Edição de agendamento inline ────────────────────
  const [editingAppt, setEditingAppt] = useState<string | null>(null);

  // ── Filtro de recebimentos ──────────────────────────
  const [billingStatus, setBillingStatus] = useState<'pendentes' | 'efetivados' | 'todos'>('pendentes');
  const [billingFrom, setBillingFrom] = useState('');
  const [billingTo, setBillingTo] = useState('');

  // ── Configuração de recebimento do cliente ──────────
  const da = patient.dadosAcademicos; // reuse patient for now — we store this in extended fields
  const [editingConfig, setEditingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Config stored in patient.rotina temporarily as a workaround until a dedicated field exists
  const storedConfig = (patient.rotina as unknown as RecebimentoConfig | null) ?? null;
  const [config, setConfig] = useState<RecebimentoConfig>({
    formaPagamento: storedConfig?.formaPagamento ?? '',
    dataFechamento: storedConfig?.dataFechamento ?? '',
    valorPackageCents: storedConfig?.valorPackageCents ?? patient.packageAmountCents ?? null,
    valorSessaoExtraCents: storedConfig?.valorSessaoExtraCents ?? null,
  });
  const [pkgDisplay, setPkgDisplay] = useState(
    config.valorPackageCents ? formatBRL(config.valorPackageCents) : '',
  );
  const [extraDisplay, setExtraDisplay] = useState(
    config.valorSessaoExtraCents ? formatBRL(config.valorSessaoExtraCents) : '',
  );

  const saveConfig = async () => {
    setSavingConfig(true);
    const updated: RecebimentoConfig = {
      ...config,
      valorPackageCents: parseBRL(pkgDisplay),
      valorSessaoExtraCents: parseBRL(extraDisplay),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await updatePatientExtendedAction(patient.id, { rotina: updated as any });
    setSavingConfig(false);
    if (result.ok) { setConfig(updated); setEditingConfig(false); toast.success('Configuração salva.'); }
    else toast.error(result.error ?? 'Erro ao salvar.');
  };

  // ── Dados filtrados ─────────────────────────────────
  const filteredAppts = useMemo(() => {
    return appointments.filter((a) => {
      if (apptFrom && a.date < apptFrom) return false;
      if (apptTo && a.date > apptTo) return false;
      return true;
    });
  }, [appointments, apptFrom, apptTo]);

  const filteredBillings = useMemo(() => {
    return billings.filter((b) => {
      if (billingStatus === 'pendentes' && b.status !== 'pendente') return false;
      if (billingStatus === 'efetivados' && b.status !== 'pago') return false;
      if (billingFrom && b.dueDate < billingFrom) return false;
      if (billingTo && b.dueDate > billingTo) return false;
      return true;
    });
  }, [billings, billingStatus, billingFrom, billingTo]);

  const pendingCents = billings
    .filter((b) => b.status === 'pendente')
    .reduce((s, b) => s + b.amountCents, 0);
  const paidCents = billings
    .filter((b) => b.status === 'pago')
    .reduce((s, b) => s + b.amountCents, 0);

  return (
    <div className="space-y-6">

      {/* ══════════════ AGENDAMENTOS ══════════════ */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Agendamentos
            </CardTitle>
            <p className="text-sm text-muted-foreground">Sessões do cliente com filtro por período.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`${routes.agenda}?patientId=${patient.id}`}>
              <Plus className="mr-2 h-4 w-4" /> Novo agendamento
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Filtro de período */}
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="space-y-1">
              <Label className="text-xs">Data inicial</Label>
              <Input type="date" className="h-8 w-36 text-sm" value={apptFrom} onChange={(e) => setApptFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data final</Label>
              <Input type="date" className="h-8 w-36 text-sm" value={apptTo} onChange={(e) => setApptTo(e.target.value)} />
            </div>
            {(apptFrom || apptTo) ? (
              <Button variant="ghost" size="sm" className="h-8" onClick={() => { setApptFrom(''); setApptTo(''); }}>
                Limpar
              </Button>
            ) : null}
            <p className="ml-auto text-xs text-muted-foreground self-end pb-1">
              {filteredAppts.length} agendamento{filteredAppts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredAppts.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum agendamento no período selecionado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Profissional</th>
                    <th className="px-4 py-3 hidden md:table-cell">Obs.</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAppts.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(a.date)}</td>
                      <td className="px-4 py-3 capitalize">{a.type ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          a.status === 'realizada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          a.status === 'cancelada' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        )}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.professionalName ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{a.notes ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Editar agendamento"
                          onClick={() => setEditingAppt(editingAppt === a.id ? null : a.id)}
                          asChild
                        >
                          <Link href={`${routes.agenda}?edit=${a.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════ RECEBIMENTOS ══════════════ */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Recebimentos
            </CardTitle>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.financeiro}>
              <Plus className="mr-2 h-4 w-4" /> Novo lançamento
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* ── Configuração de cobrança ── */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Configuração de cobrança</p>
              {!editingConfig ? (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingConfig(true)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={saveConfig} disabled={savingConfig}>
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Salvar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingConfig(false)} disabled={savingConfig}>
                    <X className="mr-1.5 h-3.5 w-3.5" /> Cancelar
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Forma de pagamento</Label>
                {editingConfig ? (
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={config.formaPagamento}
                    onChange={(e) => setConfig((c) => ({ ...c, formaPagamento: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : (
                  <p className="text-sm py-2">{config.formaPagamento || <span className="text-muted-foreground">—</span>}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Data de fechamento</Label>
                {editingConfig ? (
                  <Input
                    type="date"
                    className="h-9"
                    value={config.dataFechamento}
                    onChange={(e) => setConfig((c) => ({ ...c, dataFechamento: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm py-2">
                    {config.dataFechamento ? formatDate(config.dataFechamento) : <span className="text-muted-foreground">—</span>}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valor do pacote</Label>
                {editingConfig ? (
                  <Input
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    className="h-9"
                    value={pkgDisplay}
                    onChange={(e) => setPkgDisplay(e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2 font-medium">
                    {config.valorPackageCents ? formatBRL(config.valorPackageCents) : <span className="text-muted-foreground font-normal">—</span>}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valor sessão extra</Label>
                {editingConfig ? (
                  <Input
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    className="h-9"
                    value={extraDisplay}
                    onChange={(e) => setExtraDisplay(e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2 font-medium">
                    {config.valorSessaoExtraCents ? formatBRL(config.valorSessaoExtraCents) : <span className="text-muted-foreground font-normal">—</span>}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Resumo ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-lg font-semibold text-amber-600">{formatBRL(pendingCents)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Efetivado</p>
              <p className="text-lg font-semibold text-emerald-600">{formatBRL(paidCents)}</p>
            </div>
          </div>

          {/* ── Filtros de lançamentos ── */}
          <div className="space-y-3">
            {/* Botões de status */}
            <div className="flex gap-2 flex-wrap">
              {(['pendentes', 'efetivados', 'todos'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setBillingStatus(s)}
                  className={cn(
                    'rounded-full px-4 py-1 text-sm font-medium border transition-colors capitalize',
                    billingStatus === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent border-border hover:bg-muted',
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Filtro de período */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-1">
                <Label className="text-xs">Data inicial</Label>
                <Input type="date" className="h-8 w-36 text-sm" value={billingFrom} onChange={(e) => setBillingFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data final</Label>
                <Input type="date" className="h-8 w-36 text-sm" value={billingTo} onChange={(e) => setBillingTo(e.target.value)} />
              </div>
              {(billingFrom || billingTo) ? (
                <Button variant="ghost" size="sm" className="h-8" onClick={() => { setBillingFrom(''); setBillingTo(''); }}>
                  Limpar
                </Button>
              ) : null}
              <p className="ml-auto text-xs text-muted-foreground self-end pb-1">
                {filteredBillings.length} lançamento{filteredBillings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredBillings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum lançamento no período selecionado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBillings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{b.description}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(b.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-600 whitespace-nowrap">
                        {formatBRL(b.amountCents)}
                      </td>
                      <td className="px-4 py-3">
                        <BillingStatusBadge status={b.derivedStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
