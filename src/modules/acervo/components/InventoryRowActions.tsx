'use client';

import { useState, useTransition } from 'react';
import { MoreVertical, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InventoryItemForm } from '@/modules/acervo/components/InventoryItemForm';
import { adjustQuantityAction } from '@/modules/acervo/actions/adjust-quantity';
import { deleteItemAction } from '@/modules/acervo/actions/delete-item';
import type { InventoryItem, Role } from '@/types/domain';

export function InventoryRowActions({
  item,
  role,
}: {
  item: InventoryItem;
  role: Role;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const canModify = role === 'admin' || role === 'recepcao';
  const canDelete = role === 'admin';
  if (!canModify) return null;

  const adjust = (delta: number) => {
    startTransition(async () => {
      const r = await adjustQuantityAction(item.id, delta);
      if (r.ok) toast.success(`Quantidade atualizada para ${r.data.quantity}.`);
      else toast.error(r.error);
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={pending || item.quantity === 0}
          onClick={() => adjust(-1)}
          aria-label="Diminuir 1"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={() => adjust(1)}
          aria-label="Adicionar 1"
        >
          <Plus className="h-4 w-4" />
        </Button>
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
            {canDelete ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (!confirm('Excluir este item? Ação irreversível.')) return;
                    startTransition(async () => {
                      const r = await deleteItemAction(item.id);
                      if (r.ok) toast.success('Item excluído.');
                      else toast.error(r.error);
                    });
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {editing ? (
        <InventoryItemForm
          mode={{ kind: 'edit', item }}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(false);
          }}
        />
      ) : null}
    </>
  );
}
