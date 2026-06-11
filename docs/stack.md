# Stack técnica

## Runtime e framework

| Item | Versão | Motivo |
|---|---|---|
| Node.js | 20 LTS | Compatível com Next 15 e Vercel. |
| Next.js | 15.x | App Router estável, Server Actions, streaming, RSC. LTS. |
| TypeScript | 5.x | Modo `strict` obrigatório. |
| React | 19 | Concurrent + Actions — casa com Next 15. |

## UI

| Item | Motivo |
|---|---|
| Tailwind CSS | Utility-first, integra nativo com shadcn. |
| shadcn/ui | Primitivas copiadas ao projeto → controle total. |
| lucide-react | Ícones SVG tree-shakable. |
| recharts | Charts simples para o dashboard (rendimento semanal). |
| sonner | Toasts acessíveis (vem via shadcn). |
| date-fns | Manipulação de datas (leve, tree-shakable). Locale `pt-BR`. |

## Formulários e validação

| Item | Motivo |
|---|---|
| React Hook Form | Performático, integra com shadcn `Form`. |
| Zod | Schema único → tipo TS + validação runtime + DTO. |
| @hookform/resolvers | Ponte RHF ↔ Zod. |

## Backend as a Service

| Item | Uso |
|---|---|
| Supabase Postgres | Banco relacional principal. |
| Supabase Auth | Login e-mail/senha, sessão via cookie. |
| Supabase Storage | Upload de arquivos em Estudos e anexos de prontuário. |
| Supabase Realtime | Chat da Supervisão; alertas de nova mensagem. |
| @supabase/ssr | Helpers oficiais para Next App Router (cookies HTTP-only). |

## Estado e dados

| Item | Uso |
|---|---|
| RSC + `revalidateTag` | Padrão para leitura. |
| TanStack Query | Apenas em listas dinâmicas, realtime, polling. |
| nuqs | Estado sincronizado com URL (filtros, abas, datas). |

## Qualidade

| Item | Uso |
|---|---|
| ESLint | `eslint-config-next` + regras customizadas. |
| Prettier | Format. |
| Vitest | Unit e integration. |
| Testing Library | Componentes. |
| Playwright | E2E. |
| Husky + lint-staged | Pre-commit. |

## Infra e deploy

| Item | Uso |
|---|---|
| Vercel | Hosting Next, preview por PR. |
| Supabase Cloud | DB, Auth, Storage gerenciados. |
| GitHub Actions | Pipeline de migrations + testes. |

## Decisões deliberadamente evitadas

- **ORM pesado (Prisma/Drizzle)**: optamos pelo cliente Supabase com tipos gerados. Menor atrito, uma fonte de verdade. Reavaliar se a complexidade de queries crescer.
- **Zustand/Redux globais**: o servidor é a fonte de verdade. Estado local em `useState`/`useReducer`; URL para estado compartilhado.
- **tRPC**: Server Actions cobrem o caso; tRPC adiciona camada desnecessária.
- **Monorepo (Turborepo/Nx)**: um app só. Monorepo quando surgir segundo app (mobile, marketing).
