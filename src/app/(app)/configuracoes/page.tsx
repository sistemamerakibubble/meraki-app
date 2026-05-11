import type { Metadata } from 'next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/auth/guards';
import { TeamSearch } from '@/modules/configuracoes/components/TeamSearch';
import { TeamTable } from '@/modules/configuracoes/components/TeamTable';
import { InviteUserForm } from '@/modules/configuracoes/components/InviteUserForm';
import { HelpPanel } from '@/modules/configuracoes/components/HelpPanel';
import { PermissionsMatrix } from '@/modules/configuracoes/components/PermissionsMatrix';
import { listTeamMembers } from '@/modules/configuracoes/queries/listTeamMembers';
import { listRolePermissions } from '@/modules/configuracoes/queries/listRolePermissions';

export const metadata: Metadata = { title: 'Configurações' };

type SearchParams = Promise<{ q?: string; tab?: string }>;

function parseTab(value: string | undefined): 'equipe' | 'permissoes' | 'ajuda' {
  if (value === 'permissoes' || value === 'ajuda') return value;
  return 'equipe';
}

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireRole('admin');
  const sp = await searchParams;
  const tab = parseTab(sp.tab);

  const [members, permissionsMatrix] = await Promise.all([
    listTeamMembers(sp.q),
    listRolePermissions(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Configurações & Recursos</h1>
        <p className="text-muted-foreground">
          Configure as operações da clínica e gerencie o acesso dos usuários.
        </p>
      </header>

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="equipe">Gestão de Equipe</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="ajuda">Ajuda e Suporte</TabsTrigger>
        </TabsList>

        <TabsContent value="equipe" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <TeamSearch />
            </div>
            <InviteUserForm
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" aria-hidden />
                  Novo usuário
                </Button>
              }
            />
          </div>
          <TeamTable members={members} currentUserId={session.id} />
        </TabsContent>

        <TabsContent value="permissoes">
          <PermissionsMatrix initial={permissionsMatrix} />
        </TabsContent>

        <TabsContent value="ajuda">
          <HelpPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
