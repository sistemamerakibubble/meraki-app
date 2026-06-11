'use client';

import { useState, useTransition } from 'react';
import { MoreVertical, Pencil, Power } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditUserForm } from '@/modules/configuracoes/components/EditUserForm';
import { toggleUserActiveAction } from '@/modules/configuracoes/actions/toggle-user-active';
import type { TeamMember } from '@/modules/configuracoes/queries/listTeamMembers';

export function TeamRowActions({
  member,
  currentUserId,
}: {
  member: TeamMember;
  currentUserId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const isSelf = member.id === currentUserId;

  const toggle = () => {
    startTransition(async () => {
      const r = await toggleUserActiveAction(member.id, !member.active);
      if (r.ok) {
        toast.success(member.active ? 'Usuário desativado.' : 'Usuário ativado.');
      } else {
        toast.error(r.error);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={pending}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isSelf}
            onClick={toggle}
            className={member.active ? 'text-destructive focus:text-destructive' : ''}
          >
            <Power className="mr-2 h-4 w-4" />
            {member.active ? 'Desativar' : 'Reativar'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editing ? <EditUserForm member={member} /> : null}
    </>
  );
}
