import type { Metadata } from 'next';
import { FolderPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FolderCard } from '@/modules/estudos/components/FolderCard';
import { FileCard } from '@/modules/estudos/components/FileCard';
import { NewFolderDialog } from '@/modules/estudos/components/NewFolderDialog';
import { UploadButton } from '@/modules/estudos/components/UploadButton';
import { listRootFolders } from '@/modules/estudos/queries/listRootFolders';
import { listRecentFiles } from '@/modules/estudos/queries/listRecentFiles';

export const metadata: Metadata = { title: 'Estudos' };

export default async function EstudosPage() {
  const [folders, recentFiles] = await Promise.all([listRootFolders(), listRecentFiles(12)]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Biblioteca Digital</h1>
          <p className="text-muted-foreground">Central de conhecimento e materiais de apoio.</p>
        </div>
        <div className="flex gap-2">
          <NewFolderDialog
            trigger={
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" aria-hidden />
                Nova pasta
              </Button>
            }
          />
          <UploadButton />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Pastas</h2>
        {folders.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhuma pasta criada. Comece organizando seus materiais.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
            {folders.map((f) => (
              <FolderCard key={f.id} folder={f} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
          Arquivos recentes
        </h2>
        {recentFiles.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhum arquivo enviado ainda.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentFiles.map((f) => (
              <FileCard key={f.id} file={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
