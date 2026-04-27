# Project Map — Meraki

**Este é o arquivo-bússola.** Antes de mexer em qualquer coisa, localize aqui onde ela vive e qual doc explica as regras.

---

## 1. "Preciso mexer em X — onde?"

### Domínio / features

| Vou mexer em... | Código | Docs |
|---|---|---|
| Login / sessão / logout | [src/modules/auth/](src/modules/auth/README.md) | [docs/auth.md](docs/auth.md) |
| Dashboard (cards, chart, widgets) | [src/modules/dashboard/](src/modules/dashboard/README.md) | — |
| Agenda (grid, agendamentos) | [src/modules/agenda/](src/modules/agenda/README.md) | [src/app/(app)/agenda](src/app/(app)/agenda/README.md) |
| Pacientes / prontuários | [src/modules/pacientes/](src/modules/pacientes/README.md) | [src/app/(app)/pacientes](src/app/(app)/pacientes/README.md) |
| Financeiro | [src/modules/financeiro/](src/modules/financeiro/README.md) | [src/app/(app)/financeiro](src/app/(app)/financeiro/README.md) |
| Acervo / estoque | [src/modules/acervo/](src/modules/acervo/README.md) | [src/app/(app)/acervo](src/app/(app)/acervo/README.md) |
| Supervisão / chat | [src/modules/supervisao/](src/modules/supervisao/README.md) | [src/app/(app)/supervisao](src/app/(app)/supervisao/README.md) |
| Estudos / biblioteca | [src/modules/estudos/](src/modules/estudos/README.md) | [src/app/(app)/estudos](src/app/(app)/estudos/README.md) |
| Configurações / equipe | [src/modules/configuracoes/](src/modules/configuracoes/README.md) | [src/app/(app)/configuracoes](src/app/(app)/configuracoes/README.md) |

### UI / design system

| Vou mexer em... | Onde |
|---|---|
| Adicionar primitiva shadcn (Button, Dialog, etc.) | [src/components/ui/](src/components/ui/README.md) — via CLI |
| Header, nav, AppShell, AuthShell | [src/components/layout/](src/components/layout/README.md) |
| Componentes compostos cross-módulo (DataTable, StatCard) | [src/components/shared/](src/components/shared/README.md) |
| Tema / cores / tokens | `tailwind.config.ts` + `src/app/globals.css` |
| Ícones | `lucide-react` |

### Rotas

| Vou mexer em... | Onde |
|---|---|
| Estrutura de rotas do App Router | [src/app/](src/app/README.md) |
| Layouts / loading / error por segmento | [src/app/(app)/](src/app/(app)/README.md) / [src/app/(auth)/](src/app/(auth)/README.md) |
| Route handlers (webhooks, exports) | [src/app/api/](src/app/api/README.md) |
| Middleware (sessão, redirects) | `src/middleware.ts` |

### Dados e infraestrutura

| Vou mexer em... | Onde |
|---|---|
| Schema do banco | [supabase/migrations/](supabase/migrations/README.md) + [docs/data-model.md](docs/data-model.md) |
| Policies RLS | Migration da tabela ou [supabase/policies/](supabase/policies/README.md) |
| Seed de desenvolvimento | [supabase/seed/](supabase/seed/README.md) |
| Edge Functions | [supabase/functions/](supabase/functions/README.md) |
| Clients Supabase (server / browser / admin) | [src/lib/supabase/](src/lib/supabase/README.md) |
| Guards (requireUser, requireRole) | [src/lib/auth/](src/lib/auth/README.md) |
| Validação compartilhada (CPF, e-mail, etc.) | [src/lib/validation/](src/lib/validation/README.md) |
| Utilitários puros (money, dates, slug) | [src/lib/utils/](src/lib/utils/README.md) |
| Constantes globais (rotas, papéis, limites) | [src/lib/constants/](src/lib/constants/README.md) |
| `process.env` / feature flags | [src/config/](src/config/README.md) |
| Tipos gerados do DB | [src/types/](src/types/README.md) (`supabase gen types`) |

### Qualidade

| Vou mexer em... | Onde |
|---|---|
| Convenções de código | [docs/conventions.md](docs/conventions.md) |
| Estratégia de testes | [tests/STRATEGY.md](tests/STRATEGY.md) |
| Plano de cobertura por módulo | [tests/coverage/](tests/coverage/README.md) |
| E2E | [tests/e2e/](tests/e2e/README.md) + [tests/README.md](tests/README.md) |

### Entrega

| Vou mexer em... | Onde |
|---|---|
| Deploy / env / pipeline | [docs/deployment.md](docs/deployment.md) |
| Roadmap / fases | [docs/roadmap.md](docs/roadmap.md) |
| Stack e decisões | [docs/stack.md](docs/stack.md) |
| Visão macro da arquitetura | [ARCHITECTURE.md](ARCHITECTURE.md) |

---

## 2. Índice completo de documentação

### Raiz
- [README.md](README.md) — visão de produto.
- [ARCHITECTURE.md](ARCHITECTURE.md) — camadas, regras de dependência, fluxos.
- [PROJECT_MAP.md](PROJECT_MAP.md) — este arquivo.
- [.env.example](.env.example) — variáveis esperadas.

### docs/
- [docs/README.md](docs/README.md)
- [docs/stack.md](docs/stack.md)
- [docs/conventions.md](docs/conventions.md)
- [docs/data-model.md](docs/data-model.md)
- [docs/auth.md](docs/auth.md)
- [docs/modules.md](docs/modules.md)
- [docs/deployment.md](docs/deployment.md)
- [docs/roadmap.md](docs/roadmap.md)

### src/
- [src/README.md](src/README.md)
- [src/app/README.md](src/app/README.md)
- [src/app/(auth)/README.md](src/app/(auth)/README.md)
- [src/app/(app)/README.md](src/app/(app)/README.md)
- [src/app/(app)/dashboard/README.md](src/app/(app)/dashboard/README.md)
- [src/app/(app)/agenda/README.md](src/app/(app)/agenda/README.md)
- [src/app/(app)/pacientes/README.md](src/app/(app)/pacientes/README.md)
- [src/app/(app)/financeiro/README.md](src/app/(app)/financeiro/README.md)
- [src/app/(app)/acervo/README.md](src/app/(app)/acervo/README.md)
- [src/app/(app)/supervisao/README.md](src/app/(app)/supervisao/README.md)
- [src/app/(app)/estudos/README.md](src/app/(app)/estudos/README.md)
- [src/app/(app)/configuracoes/README.md](src/app/(app)/configuracoes/README.md)
- [src/app/api/README.md](src/app/api/README.md)
- [src/components/README.md](src/components/README.md)
- [src/components/ui/README.md](src/components/ui/README.md)
- [src/components/layout/README.md](src/components/layout/README.md)
- [src/components/shared/README.md](src/components/shared/README.md)
- [src/modules/README.md](src/modules/README.md)
- [src/modules/auth/README.md](src/modules/auth/README.md)
- [src/modules/dashboard/README.md](src/modules/dashboard/README.md)
- [src/modules/agenda/README.md](src/modules/agenda/README.md)
- [src/modules/pacientes/README.md](src/modules/pacientes/README.md)
- [src/modules/financeiro/README.md](src/modules/financeiro/README.md)
- [src/modules/acervo/README.md](src/modules/acervo/README.md)
- [src/modules/supervisao/README.md](src/modules/supervisao/README.md)
- [src/modules/estudos/README.md](src/modules/estudos/README.md)
- [src/modules/configuracoes/README.md](src/modules/configuracoes/README.md)
- [src/lib/README.md](src/lib/README.md)
- [src/lib/supabase/README.md](src/lib/supabase/README.md)
- [src/lib/auth/README.md](src/lib/auth/README.md)
- [src/lib/validation/README.md](src/lib/validation/README.md)
- [src/lib/utils/README.md](src/lib/utils/README.md)
- [src/lib/constants/README.md](src/lib/constants/README.md)
- [src/hooks/README.md](src/hooks/README.md)
- [src/types/README.md](src/types/README.md)
- [src/config/README.md](src/config/README.md)

### supabase/
- [supabase/README.md](supabase/README.md)
- [supabase/migrations/README.md](supabase/migrations/README.md)
- [supabase/policies/README.md](supabase/policies/README.md)
- [supabase/seed/README.md](supabase/seed/README.md)
- [supabase/functions/README.md](supabase/functions/README.md)

### public/
- [public/README.md](public/README.md)

### tests/
- [tests/README.md](tests/README.md)
- [tests/STRATEGY.md](tests/STRATEGY.md)
- [tests/coverage/README.md](tests/coverage/README.md)
- [tests/coverage/auth.md](tests/coverage/auth.md)
- [tests/coverage/dashboard.md](tests/coverage/dashboard.md)
- [tests/coverage/agenda.md](tests/coverage/agenda.md)
- [tests/coverage/pacientes.md](tests/coverage/pacientes.md)
- [tests/coverage/financeiro.md](tests/coverage/financeiro.md)
- [tests/coverage/acervo.md](tests/coverage/acervo.md)
- [tests/coverage/supervisao.md](tests/coverage/supervisao.md)
- [tests/coverage/estudos.md](tests/coverage/estudos.md)
- [tests/coverage/configuracoes.md](tests/coverage/configuracoes.md)
- [tests/coverage/lib.md](tests/coverage/lib.md)

---

## 3. Referências externas (documentação oficial)

### Framework e runtime
- **Next.js 15** — https://nextjs.org/docs
  - App Router — https://nextjs.org/docs/app
  - Server Components — https://nextjs.org/docs/app/building-your-application/rendering/server-components
  - Server Actions — https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  - Route Handlers — https://nextjs.org/docs/app/building-your-application/routing/route-handlers
  - Middleware — https://nextjs.org/docs/app/building-your-application/routing/middleware
  - Caching & Revalidation — https://nextjs.org/docs/app/building-your-application/caching
- **React 19** — https://react.dev
- **TypeScript** — https://www.typescriptlang.org/docs

### Supabase
- **Docs principais** — https://supabase.com/docs
- **Next.js + Supabase (SSR)** — https://supabase.com/docs/guides/auth/server-side/nextjs
- **Auth** — https://supabase.com/docs/guides/auth
- **Row Level Security** — https://supabase.com/docs/guides/database/postgres/row-level-security
- **Realtime** — https://supabase.com/docs/guides/realtime
- **Storage** — https://supabase.com/docs/guides/storage
- **Edge Functions** — https://supabase.com/docs/guides/functions
- **CLI** — https://supabase.com/docs/guides/cli
- **Migrations** — https://supabase.com/docs/guides/cli/local-development

### UI / estilo
- **shadcn/ui** — https://ui.shadcn.com
  - Componentes — https://ui.shadcn.com/docs/components
  - Instalação Next — https://ui.shadcn.com/docs/installation/next
- **Tailwind CSS** — https://tailwindcss.com/docs
- **lucide-react** (ícones) — https://lucide.dev
- **Radix Primitives** (base do shadcn) — https://www.radix-ui.com/primitives/docs

### Formulários e validação
- **Zod** — https://zod.dev
- **React Hook Form** — https://react-hook-form.com
- **@hookform/resolvers** — https://github.com/react-hook-form/resolvers

### Estado e dados
- **TanStack Query v5** — https://tanstack.com/query/latest
- **nuqs** (URL state) — https://nuqs.47ng.com

### Datas e utilitários
- **date-fns** — https://date-fns.org/docs/Getting-Started
- **date-fns/locale/ptBR** — https://date-fns.org/docs/I18n

### Charts
- **Recharts** — https://recharts.org/en-US

### Testes
- **Vitest** — https://vitest.dev
- **Testing Library (React)** — https://testing-library.com/docs/react-testing-library/intro
- **Playwright** — https://playwright.dev/docs/intro

### Deploy
- **Vercel** — https://vercel.com/docs
- **Vercel + Next.js** — https://vercel.com/docs/frameworks/nextjs
- **GitHub Actions** — https://docs.github.com/actions

### Convenções
- **Conventional Commits** — https://www.conventionalcommits.org
- **Semantic Versioning** — https://semver.org

---

## 4. Cross-cutting concerns — onde cada tema mora

- **Autenticação/autorização** → [docs/auth.md](docs/auth.md), [src/lib/auth/](src/lib/auth/README.md), [src/modules/auth/](src/modules/auth/README.md), RLS em migrations.
- **Validação** → schemas Zod em cada módulo (`schemas/`) + primitivas em [src/lib/validation/](src/lib/validation/README.md).
- **Estado de URL** → `nuqs` nas pages/components de filtros.
- **Dinheiro** → sempre em centavos no DB; formatação via [src/lib/utils/](src/lib/utils/README.md) `money.ts`.
- **Timezone / locale** → `America/Sao_Paulo` e `pt-BR`. Constantes em [src/lib/constants/](src/lib/constants/README.md).
- **Uploads** → bucket `library` no Supabase Storage; ação em [src/modules/estudos/](src/modules/estudos/README.md).
- **Realtime** → atualmente só Supervisão (canal `supervision:<id>`).
- **Multi-tenant** → `org_id` em toda tabela de domínio; RLS filtra por claim do JWT.

---

## 5. Antes de abrir um PR

1. Mudou schema? → nova migration + `supabase gen types` + commit dos types.
2. Mudou env? → atualizar `.env.example` e `src/config/env.ts`.
3. Criou pasta nova? → criar `README.md` explicando responsabilidade.
4. Criou módulo novo? → listar em [docs/modules.md](docs/modules.md) e [src/modules/README.md](src/modules/README.md).
5. Teste de regressão se existir; teste novo se a superfície mudou. Ver [tests/coverage/](tests/coverage/README.md).
