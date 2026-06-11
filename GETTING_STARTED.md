# Getting Started

Guia rápido para rodar o Meraki localmente pela primeira vez.

## 1. Pré-requisitos

- **Node.js 20+** (`node -v`)
- **pnpm** (`npm i -g pnpm`) ou npm/yarn — exemplos usam pnpm
- **Supabase CLI** — https://supabase.com/docs/guides/cli
- **Docker** — requerido pelo `supabase start`

## 2. Instalação

```bash
pnpm install
```

## 3. Subir o Supabase local

```bash
supabase start
```

A saída mostra as URLs e a `anon key`. Copie-as.

## 4. Configurar env

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha:

- `NEXT_PUBLIC_SUPABASE_URL` = a `API URL` do passo 3 (geralmente `http://127.0.0.1:54321`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = a `anon key` do passo 3.
- `NEXT_PUBLIC_APP_URL` = `http://localhost:3000`.
- `SUPABASE_SERVICE_ROLE_KEY` = opcional no MVP; preenchido pelo output de `supabase start`.

## 5. Aplicar migrations e gerar types

```bash
supabase db reset         # aplica migrations em supabase/migrations + seed
pnpm supabase:types       # regenera src/types/supabase.ts
```

## 6. Criar o primeiro usuário admin

No console do Supabase local (`http://127.0.0.1:54323`) ou via CLI:

```bash
# Cria o usuário em auth.users
supabase auth users create --email admin@meraki.dev --password meraki-dev-admin
```

Copie o UUID retornado. No SQL Editor do Studio ou via `psql`, insira o profile:

```sql
insert into public.profiles (id, org_id, full_name, role)
values (
  '<UUID do passo anterior>',
  '00000000-0000-0000-0000-000000000001',
  'Admin Dev',
  'admin'
);
```

## 7. Rodar o app

```bash
pnpm dev
```

Abra `http://localhost:3000`. Faça login com `admin@meraki.dev` / `meraki-dev-admin`.

## Scripts úteis

```bash
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit
pnpm test          # unit + component (Vitest)
pnpm test:watch    # modo watch
pnpm e2e           # Playwright (precisa Supabase + next dev rodando)
pnpm format        # Prettier
```

## Próximo passo

Abra [PROJECT_MAP.md](./PROJECT_MAP.md) — navegação central do projeto.
Módulo atualmente implementado: **auth**. Próximo conforme [docs/roadmap.md](./docs/roadmap.md): **pacientes**.
