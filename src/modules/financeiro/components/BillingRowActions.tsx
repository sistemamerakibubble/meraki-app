'use client';

import { useState, useTransition } from 'react';
import { MoreVertical, Check, Pencil, Trash2, RotateCcw, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BillingForm } from '@/modules/financeiro/components/BillingForm';
import {
  markBillingPaidAction,
  changeBillingStatusAction,
  setNfStatusAction,
} from '@/modules/financeiro/actions/change-billing-status';
import { deleteBillingAction } from '@/modules/financeiro/actions/delete-billing';
import type { Billing, CreditCard, ExpenseCategory, PaymentAccount, Role } from '@/types/domain';

export function BillingRowActions({
  billing,
  patients,
  accounts = [],
  cards = [],
  categories = [],
  role,
}: {
  billing: Billing;
  patients: { id: string; fullName: string }[];
  accounts?: PaymentAccount[];
  cards?: CreditCard[];
  categories?: ExpenseCategory[];
  role: Role;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const canModify = role === 'admin' || role === 'recepcao';
  const canDelete = role === 'admin';

  if (!canModify) return null;

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, successMsg: string) => {
    startTransition(async () => {
      const r = await fn();
      if (r.ok) toast.success(successMsg);
      else toast.error(r.error ?? 'Erro');
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
          {billing.status !== 'pago' ? (
            <DropdownMenuItem
              onClick={() =>
                run(() => markBillingPaidAction(billing.id), 'Lançamento marcado como pago.')
              }
            >
              <Check className="mr-2 h-4 w-4" />
              Marcar como pago
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                run(
                  () => changeBillingStatusAction(billing.id, 'pendente'),
                  'Marcado como pendente.',
                )
              }
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Marcar como pendente
            </DropdownMenuItem>
          )}
          {billing.nfStatus !== 'emitida' ? (
            <DropdownMenuItem
              onClick={() => {
                const nfNumber = window.prompt('Número da nota fiscal (opcional):') ?? '';
                run(
                  () => setNfStatusAction(billing.id, 'emitida', nfNumber),
                  'NF marcada como emitida.',
                );
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Marcar NF como emitida
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                run(() => setNfStatusAction(billing.id, 'pendente'), 'NF marcada como pendente.')
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              Marcar NF como pendente
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {billing.status !== 'cancelado' ? (
            <DropdownMenuItem
              onClick={() =>
                run(
                  () => changeBillingStatusAction(billing.id, 'cancelado'),
                  'Lançamento cancelado.',
                )
              }
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Cancelar lançamento
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (!confirm('Excluir este lançamento? Esta ação não pode ser desfeita.')) return;
                  run(() => deleteBillingAction(billing.id), 'Lançamento excluído.');
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {editing ? (
        <BillingForm
          mode={{ kind: 'edit', billing }}
          patients={patients}
          accounts={accounts}
          cards={cards}
          categories={categories}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(false);
          }}
          onSuccess={() => setEditing(false)}
        />
      ) : null}
    </>
  );
}
