'use client';

import { startTransition, useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  generateExtraBillingsAction,
  generatePackageBillingsAction,
  type GenerateExtraBillingsResult,
  type GeneratePackageBillingsResult,
} from '@/modules/financeiro/actions/generate-billings';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function GenerateBillingsPanel() {
  const [month, setMonth] = useState(currentMonth());
  const [amount, setAmount] = useState('');

  const [pkgState, pkgAction, pkgPending] = useActionState<
    GeneratePackageBillingsResult | null,
    FormData
  >(generatePackageBillingsAction, null);
  const [extraState, extraAction, extraPending] = useActionState<
    GenerateExtraBillingsResult | null,
    FormData
  >(generateExtraBillingsAction, null);

  useEffect(() => {
    if (!pkgState) return;
    if (pkgState.ok) {
      toast.success(`${pkgState.data.createdCount} cobrança(s) de pacote gerada(s).`);
    } else {
      toast.error(pkgState.error.formError ?? 'Não foi possível gerar as cobranças.');
    }
  }, [pkgState]);

  useEffect(() => {
    if (!extraState) return;
    if (extraState.ok) {
      toast.success(`${extraState.data.createdCount} cobrança(s) de sessão extra gerada(s).`);
    } else {
      toast.error(extraState.error.formError ?? 'Não foi possível gerar as cobranças.');
    }
  }, [extraState]);

  return (
    <div className="grid gap-4 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-medium">Gerar cobranças de pacote</p>
        <p className="text-xs text-muted-foreground">
          Cria lançamentos para pacientes com plano mensal/quinzenal no mês selecionado (não
          duplica os já existentes).
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.set('month', month);
            startTransition(() => pkgAction(fd));
          }}
        >
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="max-w-[160px]"
          />
          <Button type="submit" disabled={pkgPending} variant="outline">
            {pkgPending ? 'Gerando...' : 'Gerar'}
          </Button>
        </form>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Gerar cobranças de sessões extras</p>
        <p className="text-xs text-muted-foreground">
          Cria lançamentos para sessões extras ainda sem cobrança, usando o valor informado.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const cents = Math.round(Number.parseFloat(amount.replace(',', '.')) * 100);
            if (!Number.isFinite(cents) || cents <= 0) {
              toast.error('Informe um valor válido.');
              return;
            }
            const fd = new FormData();
            fd.set('amountCents', String(cents));
            startTransition(() => extraAction(fd));
          }}
        >
          <Input
            inputMode="decimal"
            placeholder="R$ 0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="max-w-[140px]"
          />
          <Button type="submit" disabled={extraPending} variant="outline">
            {extraPending ? 'Gerando...' : 'Gerar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
