# Arquitetura — Meraki

Visão macro da arquitetura do Meraki. Para detalhes por camada, consultar o `README.md` de cada pasta.

## 1. Princípios norteadores

- **Separation of Concerns** — UI, domínio e infraestrutura isolados.
- **Feature-first / Modular Monolith** — cada domínio (agenda, pacientes, etc.) é um módulo autocontido em `src/modules/*`. As rotas em `src/app/*` apenas orquestram.
- **Server-first** — dados buscados no servidor (RSC + Server Actions) por padrão; `"use client"` apenas em bordas interativas.
- **RLS é a fronteira de segurança** — o cliente nunca é fonte de verdade para autorização. Tudo passa por policies no Postgres.
- **Contratos Zod** — formulários, actions e fronteiras de rede validam com Zod; tipos fluem do schema.
- **shadcn-first** — primitivas copiadas para `components/ui`, compostas em `components/shared` e consumidas pelos módulos.

## 2. Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  src/app/**                                                 │
│  Rotas, layouts, pages (App Router). Orquestração, zero     │
│  regra de negócio. Importa módulos.                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  src/modules/<feature>/**                                   │
│  Domínio. components/ actions/ queries/ schemas/ types/     │
│  hooks/ utils/                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  src/lib/**                                                 │
│  Infra: supabase client, validação, utilitários puros.      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase (Postgres + Auth + Storage + Realtime)            │
│  Schema SQL, policies RLS, triggers, functions.             │
└─────────────────────────────────────────────────────────────┘
```

**Regras de dependência:**

- `app/` pode importar de `modules/`, `components/`, `lib/`, `hooks/`, `types/`, `config/`.
- `modules/<X>/` pode importar de `components/`, `lib/`, `hooks/`, `types/`, `config/`.
- Um módulo **nunca** importa outro módulo diretamente. Se houver necessidade, extrair para `components/shared` ou `lib/`.
- `lib/` e `components/ui` **nunca** importam de módulos nem de `app/`.

## 3. Anatomia de um módulo (`src/modules/<feature>/`)

```
<feature>/
├── components/     Componentes visuais do módulo (Server + Client)
├── actions/        Server Actions (mutations) — "use server"
├── queries/        Data fetchers para Server Components
├── schemas/        Zod schemas (input/output)
├── types/          Tipos derivados + DTOs
├── hooks/          Hooks client-side específicos do módulo
├── utils/          Funções puras do domínio
└── README.md       Escopo, dependências, decisões
```

## 4. Rotas (App Router)

```
src/app/
├── (auth)/                 Route group público — layout de login
│   ├── login/
│   └── esqueci-senha/
├── (app)/                  Route group autenticado — shell + nav
│   ├── dashboard/
│   ├── agenda/
│   ├── pacientes/[id]/
│   ├── financeiro/
│   ├── acervo/
│   ├── supervisao/
│   ├── estudos/
│   └── configuracoes/
└── api/                    Route handlers (webhooks, uploads)
```

O redirecionamento entre grupos é feito por **middleware** que lê a sessão Supabase (cookies) e bloqueia `/` não-autenticado.

## 5. Dados

- **ORM**: cliente oficial `@supabase/supabase-js`. Tipos gerados via `supabase gen types typescript`.
- **Migrations**: SQL versionado em `supabase/migrations/`.
- **Policies RLS**: `supabase/policies/` (organizadas por tabela).
- **Seed**: `supabase/seed/` para dados de desenvolvimento.

Detalhes em [docs/data-model.md](./docs/data-model.md).

## 6. Auth

- **Supabase Auth** com e-mail/senha (MVP). Magic link e OAuth como extensão futura.
- Session cookie HTTP-only gerenciado pelo helper `@supabase/ssr`.
- Middleware Next valida sessão e renova cookies.
- Papéis: `admin`, `médico` (profissional), `supervisor`, `recepção`. Guardados em tabela `profiles` + claim JWT.

Detalhes em [docs/auth.md](./docs/auth.md).

## 7. Estado

- **Servidor (padrão)**: fetch em Server Components + revalidação por tag (`revalidateTag`).
- **Cliente**: TanStack Query **apenas** para listas dinâmicas/paginadas, realtime e formulários longos. Evitar no resto.
- **Formulários**: React Hook Form + Zod resolver.
- **URL state**: `nuqs` ou `useSearchParams` para filtros, aba ativa, datas.

## 8. UI

- shadcn/ui instalado via CLI. Componentes moram em `src/components/ui/`.
- Design tokens (cores, radius, fontes) em `tailwind.config.ts` + `app/globals.css`.
- Tema: claro (MVP). Dark mode preparado mas desligado.
- Ícones: `lucide-react`.
- Charts: `recharts` (Rendimento semanal do dashboard).

## 9. Observabilidade

- Logs estruturados via `console` + captura Vercel.
- Erros no cliente: Sentry (opcional pós-MVP).
- Supabase logs para queries lentas e falhas RLS.

## 10. Testes

- **Unit**: Vitest, foco em `lib/` e `modules/*/utils` e `schemas`.
- **Integration**: Testing Library sobre componentes de formulário.
- **E2E**: Playwright em fluxos críticos (login, criar agendamento, criar paciente).

Detalhes em [tests/README.md](./tests/README.md).

## 11. Deploy

- **Vercel** (Next app).
- **Supabase Cloud** (Postgres + Auth + Storage).
- Env separado por ambiente: `development`, `preview`, `production`.
- Migrations rodam via CLI do Supabase em pipeline (GitHub Actions).

Detalhes em [docs/deployment.md](./docs/deployment.md).

## 12. Não-objetivos do MVP

- Sem app mobile nativo (web responsivo atende).
- Sem integração com gateways de pagamento (financeiro é gestão interna).
- Sem teleconsulta embutida (campo "Online" na agenda registra apenas a modalidade).
- Sem multi-tenant real no MVP — single-org. RLS preparada para multi-tenant futuro via coluna `org_id`.
