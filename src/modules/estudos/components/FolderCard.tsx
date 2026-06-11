'use client';

import Link from 'next/link';
import { Folder, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { deleteFolderAction } from '@/modules/estudos/actions/delete-folder';
import { routes } from '@/lib/constants/routes';
import type { LibraryFolder } from '@/types/domain';

export function FolderCard({ folder }: { folder: LibraryFolder }) {
  const [pending, startTransition] = useTransition();

  const remove = () => {
    if (!confirm(`Excluir "${folder.name}" e todos os arquivos dentro dela?`)) return;
    startTransition(async () => {
      const r = await deleteFolderAction(folder.id);
      if (r.ok) toast.success('Pasta excluída.');
      else toast.error(r.error);
    });
  };

  return (
    <Card className="group relative overflow-hidden transition-colors hover:bg-accent/30">
      <Link
        href={routes.folder(folder.id)}
        className="flex flex-col items-center justify-center gap-2 p-6 text-center"
      >
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary/10 text-primary">
          <Folder className="h-7 w-7" aria-hidden />
        </div>
        <span className="line-clamp-2 text-sm font-medium">{folder.name}</span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={remove}
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Excluir pasta"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}
