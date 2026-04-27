import { formatDate } from '@/lib/utils/dates';
import { RoleBadge } from '@/modules/configuracoes/components/RoleBadge';
import { TeamRowActions } from '@/modules/configuracoes/components/TeamRowActions';
import type { TeamMember } from '@/modules/configuracoes/queries/listTeamMembers';

export function TeamTable({
  members,
  currentUserId,
}: {
  members: TeamMember[];
  currentUserId: string;
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Nenhum usuário encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste a busca ou convide um novo membro.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Papel</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Desde</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-3">
                <span className="font-medium">{m.fullName}</span>
                {m.id === currentUserId ? (
                  <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{m.email || '—'}</td>
              <td className="px-4 py-3">
                <RoleBadge role={m.role} />
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    m.active
                      ? 'inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400'
                      : 'inline-flex items-center gap-2 text-xs text-muted-foreground'
                  }
                >
                  <span
                    className={
                      m.active
                        ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                        : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/50'
                    }
                    aria-hidden
                  />
                  {m.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(m.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <TeamRowActions member={m} currentUserId={currentUserId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
