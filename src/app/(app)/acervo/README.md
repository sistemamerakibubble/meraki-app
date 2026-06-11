# /acervo

Controle de estoque / Acervo Técnico.

## Query params

- `q` — busca por nome.
- `category` — filtro de categoria.
- `lowStock` — `1` quando checkbox marcado.

## Dados

- `getInventorySummary(orgId)` — total de itens, itens com estoque baixo, categorias.
- `listInventoryItems({ orgId, q, category, lowStock })`.
- `listInventoryCategories(orgId)`.

## Ações

- "+ Novo Item" → Dialog com `<InventoryItemForm />`.
- Ícone de lápis na linha → edição inline (Dialog).
- "Exportar" → chama `GET /api/exports/inventory` com filtros atuais.
