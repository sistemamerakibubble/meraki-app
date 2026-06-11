'use client';

import { FileIcon, FileImage, FileText, FileSpreadsheet, Trash2, Download } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { deleteFileAction } from '@/modules/estudos/actions/delete-file';
import { formatDate } from '@/lib/utils/dates';
import type { LibraryFile } from '@/types/domain';

function sizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function iconFor(mime: string) {
  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('pdf')) return FileText;
  if (mime.includes('spreadsheet') || mime.includes('excel')) return FileSpreadsheet;
  return FileIcon;
}

export function FileCard({ file }: { file: LibraryFile }) {
  const [pending, startTransition] = useTransition();
  const Icon = iconFor(file.mimeType);

  const remove = () => {
    if (!confirm(`Excluir "${file.name}"?`)) return;
    startTransition(async () => {
      const r = await deleteFileAction(file.id);
      if (r.ok) toast.success('Arquivo excluído.');
      else toast.error(r.error);
    });
  };

  return (
    <Card className="group relative overflow-hidden">
      <a
        href={`/api/files/${file.id}`}
        className="flex items-start gap-3 p-4"
        title="Baixar"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {sizeLabel(file.sizeBytes)} · {formatDate(file.createdAt)}
          </p>
          {file.uploaderName ? (
            <p className="truncate text-xs text-muted-foreground">Por {file.uploaderName}</p>
          ) : null}
        </div>
        <Download className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
      </a>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={remove}
        className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Excluir arquivo"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}
