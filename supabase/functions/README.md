# supabase/functions/

Edge Functions do Supabase (Deno). **Uso restrito** no MVP.

## Casos de uso

- **`auth-hook`** (opcional) — injeta `org_id` e `role` como claim no JWT durante login.
- **`inventory-export`** (opcional) — se o CSV ficar pesado demais para Vercel function.

## Regras

- Código em Deno/TS — diferente do resto do app.
- Cada function numa subpasta com `index.ts`.
- Deploy: `supabase functions deploy <name>`.
- Secrets: `supabase secrets set`.

> No MVP, prefira Server Actions em Next. Só migrar para Edge Function se houver razão clara (volume, latência, proximidade do DB).
