# /financeiro

Gestão financeira — faturamento, despesas, lucro.

## Query params

- `from` / `to` — período (ISO date).
- `status` — `todos` | `pendente` | `pago` | `atrasado` | `cancelado`.
- `page`.

## Dados

- `getFinancialSummary({ orgId, from, to })` — receita, despesas, lucro.
- `listBillings({ orgId, from, to, status, page })` — tabela paginada.

## Ações

- "Novo Faturamento" → Dialog com `<BillingForm />`.
- Remover filtros → reset dos query params.
- Linha: editar, marcar como pago, excluir (admin).
