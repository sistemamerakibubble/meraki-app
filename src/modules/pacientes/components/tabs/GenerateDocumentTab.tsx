'use client';

import { useState } from 'react';
import { Printer, FileText, FileBadge2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils/dates';
import type { Patient, SessionUser } from '@/types/domain';

type DocumentKind = 'atestado' | 'declaracao';

const KINDS: Record<DocumentKind, { title: string; description: string; bodyHint: string }> = {
  atestado: {
    title: 'Atestado',
    description: 'Atesta presença / afastamento do paciente.',
    bodyHint:
      'Ex.: por motivo de saúde, durante o período abaixo. Especifique o número de horas/dias e o CID se aplicável.',
  },
  declaracao: {
    title: 'Declaração',
    description: 'Declara comparecimento ou outra situação relevante.',
    bodyHint: 'Ex.: para fins de comprovação, declara que esteve em consulta no dia abaixo.',
  },
};

export function GenerateDocumentTab({
  patient,
  user,
  orgName,
}: {
  patient: Patient;
  user: SessionUser;
  orgName: string;
}) {
  const [kind, setKind] = useState<DocumentKind>('atestado');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [body, setBody] = useState<string>('');
  const [crm, setCrm] = useState<string>('');
  const cfg = KINDS[kind];

  const handlePrint = () => {
    if (!body.trim()) {
      window.alert('Preencha o conteúdo do documento antes de imprimir.');
      return;
    }
    const html = renderDocument({
      kind,
      patient,
      date,
      body,
      authorName: user.profile.fullName,
      crm: crm.trim(),
      orgName,
    });
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) {
      window.alert('Permita pop-ups para imprimir o documento.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gerar documento / laudo</CardTitle>
        <CardDescription>
          Modelos prontos para impressão (atestado, declaração de comparecimento).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block">Tipo de documento</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as DocumentKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atestado">
                  <span className="flex items-center gap-2">
                    <FileBadge2 className="h-4 w-4" /> Atestado
                  </span>
                </SelectItem>
                <SelectItem value="declaracao">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Declaração
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Data do documento</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="mb-1 block">Conteúdo</Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder={cfg.bodyHint}
            className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">{cfg.description}</p>
        </div>

        <div>
          <Label className="mb-1 block">Registro profissional (opcional)</Label>
          <Input
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            placeholder="Ex.: CRM/SP 123456 — CRP 06/12345"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" aria-hidden /> Imprimir / Salvar PDF
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          O documento será aberto em nova aba para impressão. No diálogo de impressão, escolha
          &quot;Salvar como PDF&quot; se quiser baixar.
        </p>
      </CardContent>
    </Card>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderDocument(input: {
  kind: DocumentKind;
  patient: Patient;
  date: string;
  body: string;
  authorName: string;
  crm: string;
  orgName: string;
}): string {
  const title = KINDS[input.kind].title.toUpperCase();
  const dateLabel = formatDate(input.date);
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)} - ${escapeHtml(input.patient.fullName)}</title>
<style>
  @page { size: A4; margin: 24mm 22mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #111; line-height: 1.6; font-size: 13pt; }
  header { border-bottom: 1px solid #999; padding-bottom: 12px; margin-bottom: 24px; }
  header h1 { font-size: 14pt; margin: 0; letter-spacing: 0.04em; }
  header p { margin: 4px 0 0; color: #555; font-size: 10pt; }
  h2 { text-align: center; font-size: 18pt; margin: 24px 0; letter-spacing: 0.1em; }
  .body { text-align: justify; white-space: pre-wrap; min-height: 280px; }
  .signature { margin-top: 80px; text-align: center; }
  .signature .line { width: 280px; border-top: 1px solid #333; margin: 0 auto 6px; }
  .meta { margin-top: 32px; font-size: 11pt; color: #444; }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(input.orgName)}</h1>
    <p>Documento emitido em ${escapeHtml(dateLabel)}</p>
  </header>
  <h2>${escapeHtml(title)}</h2>
  <div class="meta">
    <p><strong>Paciente:</strong> ${escapeHtml(input.patient.fullName)}${
      input.patient.document
        ? ` &middot; <strong>CPF:</strong> ${escapeHtml(input.patient.document)}`
        : ''
    }</p>
  </div>
  <div class="body">${escapeHtml(input.body)}</div>
  <div class="signature">
    <div class="line"></div>
    <div>${escapeHtml(input.authorName)}</div>
    ${input.crm ? `<div>${escapeHtml(input.crm)}</div>` : ''}
  </div>
</body>
</html>`;
}
