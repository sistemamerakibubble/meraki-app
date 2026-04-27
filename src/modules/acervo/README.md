# modules/acervo

Controle de estoque (materiais, livros, testes, etc.).

## Estrutura

```
acervo/
├── components/
│   ├── InventoryView.tsx
│   ├── InventoryFilters.tsx    Busca, categoria, baixo estoque
│   ├── InventorySummary.tsx    Cards total/baixo/categorias
│   ├── InventoryTable.tsx
│   ├── InventoryItemForm.tsx   Dialog criar/editar
│   └── ExportButton.tsx
├── actions/
│   ├── create-item.ts
│   ├── update-item.ts
│   └── delete-item.ts
├── queries/
│   ├── getInventorySummary.ts
│   ├── listInventoryItems.ts
│   └── listInventoryCategories.ts
├── schemas/
│   └── inventory-item.ts
└── types/index.ts
```

## Regras

- "Baixo estoque" = `quantity <= min_quantity`. Calculado em query.
- `tag` é etiqueta livre ("Livro", "Teste", "Manual") — não confundir com `category`.
- Exportar CSV via `/api/exports/inventory?...filtros` — respeita filtros ativos.
- Atualização concorrente: usar `optimistic lock` via coluna `updated_at` opcional no MVP.
