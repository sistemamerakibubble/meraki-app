# src/app/

App Router do Next 15. **Papel desta pasta: orquestração**. Nada de regra de negócio aqui.

## Estrutura

```
app/
├── layout.tsx                  Root layout. Fonte, providers globais, <body>.
├── globals.css                 Tailwind base + tokens shadcn.
├── not-found.tsx               404 global.
├── error.tsx                   Error boundary raiz.
│
├── (auth)/                     Route group público
│   ├── layout.tsx              Shell de login (esplit screen da imagem).
│   ├── login/page.tsx
│   ├── esqueci-senha/page.tsx
│   └── redefinir-senha/page.tsx
│
├── (app)/                      Route group autenticado
│   ├── layout.tsx              AppShell: header + nav + container.
│   ├── loading.tsx             Skeleton padrão.
│   ├── error.tsx
│   ├── dashboard/page.tsx
│   ├── agenda/page.tsx
│   ├── pacientes/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── financeiro/page.tsx
│   ├── acervo/page.tsx
│   ├── supervisao/page.tsx
│   ├── estudos/
│   │   ├── page.tsx
│   │   └── pasta/[id]/page.tsx
│   └── configuracoes/page.tsx
│
└── api/                        Route handlers (webhooks, upload assinado)
```

## Convenções

- **`page.tsx` é magro**: busca dados via `modules/<X>/queries/*` e passa para componentes do módulo.
- **Server Component por padrão.** `"use client"` só em componentes de módulo/UI quando inevitável.
- **Metadata** via `generateMetadata` quando dinâmica, estática em constante `export const metadata`.
- **Streaming**: envolver seções pesadas com `<Suspense fallback={<Skeleton />}>`.
- **Error boundary local** (`error.tsx`) em cada segmento crítico.
- **Route groups** `()`:
  - `(auth)` — público, sem AppShell.
  - `(app)` — autenticado, com AppShell. `layout.tsx` chama `requireUser()`.

## O que NÃO vai aqui

- Fetchers (→ `modules/<X>/queries`).
- Server actions (→ `modules/<X>/actions`).
- Componentes UI reutilizáveis (→ `components/`).
- Schemas Zod (→ `modules/<X>/schemas`).
