# modules/financeiro

Faturamento e gestão financeira.

## Estrutura

```
financeiro/
├── components/
│   ├── FinancialView.tsx
│   ├── FinancialSummary.tsx     Receita / Despesas / Lucro
│   ├── BillingFilters.tsx       Período, status, remover filtros
│   ├── BillingsTable.tsx
│   └── BillingForm.tsx          Dialog criar/editar
├── actions/
│   ├── create-billing.ts
│   ├── update-billing.ts
│   ├── mark-billing-paid.ts
│   └── delete-billing.ts
├── queries/
│   ├── getFinancialSummary.ts
│   └── listBillings.ts
├── schemas/
│   └── billing.ts
├── utils/
│   └── money.ts                 centavos ↔ BRL (reexport de lib/utils)
└── types/index.ts
```

## Regras

- Valores em **centavos** (`amount_cents: integer`). UI converte para exibição.
- Status `atrasado` é derivado em query (`due_date < today and status = 'pendente'`), não armazenado.
- Permissão de write: `admin` e `recepcao` (enforced via RLS).
- "Receita do mês atual" no card de Lucro Líquido pressupõe filtro de mês corrente — pode divergir do intervalo da tabela. Documentar na UI.
