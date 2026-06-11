# Deploy

## Ambientes

| Ambiente | Branch | URL | Supabase project |
|---|---|---|---|
| development | local | `http://localhost:3000` | `meraki-dev` |
| preview | PRs | `*.vercel.app` | `meraki-dev` (compartilhado) |
| production | `main` | domínio oficial | `meraki-prod` |

## Variáveis de ambiente

Arquivo de referência: `.env.example`. Validadas em runtime via `src/config/env.ts` (Zod).

```
# Público (pode vazar para o browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# Privado (apenas server)
SUPABASE_SERVICE_ROLE_KEY=   # só em jobs admin, nunca exposto
DATABASE_URL=                 # opcional, para CLI/migrations
```

## Vercel

- Projeto único ligado ao GitHub.
- `main` → produção.
- PR → preview automático.
- Build command: `next build` (padrão).
- Node: 20.
- Regiões: `gru1` (São Paulo) para latência BR.

## Supabase

- Duas instâncias: `meraki-dev` e `meraki-prod`.
- Migrations aplicadas via Supabase CLI no pipeline:

```
supabase db push --db-url $PROD_DATABASE_URL
```

- Storage bucket `library` privado. Policies via SQL em `supabase/migrations/`.
- Auth → e-mail/senha, magic link desabilitado, signup público **desabilitado**.

## Pipeline (GitHub Actions)

`.github/workflows/ci.yml`:

1. `lint` — ESLint + TypeCheck.
2. `test` — Vitest.
3. `build` — `next build` (garante que compila).
4. `migrate-check` — diff local vs remote dev para evitar drift.

`.github/workflows/deploy-migrations.yml` (manual ou em `main`):

1. Checkout.
2. Supabase CLI login.
3. `supabase db push` para produção (com approval).

## Migrations workflow

Local:
```
supabase start                    # sobe Postgres + Auth locais
supabase migration new <slug>     # cria arquivo em supabase/migrations
supabase db reset                 # aplica tudo do zero + seed
```

Antes de abrir PR:
- Gerar types: `supabase gen types typescript --local > src/types/supabase.ts`.
- Commit junto da migration.

## Secrets (GitHub / Vercel)

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF_PROD`
- `SUPABASE_DB_PASSWORD_PROD`
- `VERCEL_TOKEN` (se usar CLI)

Nunca commit. Nunca em logs.

## Rollback

- **Código**: revert do commit em `main` → Vercel redeploya.
- **Migration**: cada migration de risco deve ter script `down` preparado em `supabase/rollback/<name>.sql`. Restore de backup é o último recurso.

## Backups

- Supabase faz backup diário automático no plano Pro.
- Download semanal manual para storage externo (S3/Drive) no início.
