import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FolderPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FolderCard } from '@/modules/estudos/components/FolderCard';
import { FileCard } from '@/modules/estudos/components/FileCard';
import { NewFolderDialog } from '@/modules/estudos/components/NewFolderDialog';
import { UploadButton } from '@/modules/estudos/components/UploadButton';
import { getFolder } from '@/modules/estudos/queries/getFolder';
import { listFolderContents } from '@/modules/estudos/queries/listFolderContents';
import { routes } from '@/lib/constants/routes';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const folder = await getFolder(id);
  return { title: folder?.name ?? 'Pasta' };
}

export default async function FolderPage({ params }: { params: Params }) {
  const { id } = await params;
  const folder = await getFolder(id);
  if (!folder) notFound();

  const { subfolders, files } = await listFolderContents(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="gap-1 px-2">
          <Link href={routes.estudos}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
        </Button>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{folder.name}</h1>
          <p className="text-muted-foreground">
            {subfolders.length} subpasta(s) · {files.length} arquivo(s)
          </p>
        </div>
        <div className="flex gap-2">
          <NewFolderDialog
            parentId={folder.id}
            trigger={
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" aria-hidden />
                Nova subpasta
              </Button>
            }
          />
          <UploadButton folderId={folder.id} />
        </div>
      </header>

      {subfolders.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Subpastas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
            {subfolders.map((f) => (
              <FolderCard key={f.id} folder={f} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Arquivos</h2>
        {files.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhum arquivo nesta pasta ainda.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {files.map((f) => (
              <FileCard key={f.id} file={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
