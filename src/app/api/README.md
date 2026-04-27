# app/api/

Route handlers. Usar **apenas** quando Server Actions não atendem:

- Webhooks externos (Supabase Auth hooks, Stripe futuro).
- Endpoints que servem arquivos (URLs assinadas de download, exports CSV).
- Integrações que precisam de verbo HTTP específico.

## Estrutura sugerida

```
api/
├── webhooks/
│   └── supabase/route.ts       Auth hooks (inject claims, etc.)
├── exports/
│   └── inventory/route.ts      CSV de estoque (GET)
└── health/route.ts             Healthcheck
```

## Convenções

- Exportar `GET`, `POST`, etc. nomeados.
- Validar body com Zod no início.
- Retornar `Response` com status explícito.
- Autenticar via cookie Supabase (mesmo helper dos Server Components).
- Webhooks validam assinatura HMAC antes de qualquer lógica.

## O que NÃO vai aqui

- Mutations de UI — essas viram Server Actions em `modules/<X>/actions`.
- Queries triviais — Server Components buscam direto.
