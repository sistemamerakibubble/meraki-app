'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, CreditCard as CreditCardIcon, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { PaymentAccountForm } from './PaymentAccountForm';
import { CreditCardForm } from './CreditCardForm';
import { deletePaymentAccountAction } from '@/modules/financeiro/actions/create-payment-account';
import { deleteCreditCardAction } from '@/modules/financeiro/actions/create-credit-card';
import { ACCOUNT_TYPE_LABELS, type PaymentAccount, type CreditCard } from '@/types/domain';

type Props = {
  accounts: PaymentAccount[];
  cards: CreditCard[];
};

export function PaymentMethodsManager({ accounts, cards }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteAccount(id: string) {
    if (!confirm('Desativar esta conta bancária?')) return;
    setDeletingId(id);
    const result = await deletePaymentAccountAction(id);
    setDeletingId(null);
    if (!result.ok) toast.error('Não foi possível desativar a conta.');
  }

  async function handleDeleteCard(id: string) {
    if (!confirm('Desativar este cartão?')) return;
    setDeletingId(id);
    const result = await deleteCreditCardAction(id);
    setDeletingId(null);
    if (!result.ok) toast.error('Não foi possível desativar o cartão.');
  }

  return (
    <div className="space-y-8">
      {/* Contas bancárias */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Contas bancárias</h3>
          </div>
          <PaymentAccountForm
            mode={{ kind: 'create' }}
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nova conta
              </Button>
            }
          />
        </div>

        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conta bancária cadastrada.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{account.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ACCOUNT_TYPE_LABELS[account.accountType]}
                    {account.bankName ? ` · ${account.bankName}` : ''}
                    {account.agency ? ` · Ag. ${account.agency}` : ''}
                    {account.accountNumber ? ` · C/C ${account.accountNumber}` : ''}
                  </p>
                </div>
                <div className="flex gap-1">
                  <PaymentAccountForm
                    mode={{ kind: 'edit', account }}
                    trigger={
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={deletingId === account.id}
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Cartões de crédito */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Cartões de crédito</h3>
          </div>
          <CreditCardForm
            mode={{ kind: 'create' }}
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Novo cartão
              </Button>
            }
          />
        </div>

        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {cards.map((card) => (
              <li key={card.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-sm">
                    {card.name}
                    {card.lastFour ? (
                      <span className="ml-2 text-muted-foreground font-normal">
                        •••• {card.lastFour}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.brand ?? 'Cartão de crédito'}
                    {card.closingDay ? ` · Fecha dia ${card.closingDay}` : ''}
                    {card.dueDay ? ` · Vence dia ${card.dueDay}` : ''}
                  </p>
                </div>
                <div className="flex gap-1">
                  <CreditCardForm
                    mode={{ kind: 'edit', card }}
                    trigger={
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={deletingId === card.id}
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
