# lib/supabase/

Adaptadores oficiais Supabase + helpers tipados.

## Arquivos

```
supabase/
├── server.ts         createServerClient para Server Components/Actions
├── client.ts         createBrowserClient para "use client"
├── middleware.ts     createMiddlewareClient (renovação de cookies)
├── admin.ts          createAdminClient (Service Role) — uso restrito
├── types.ts          Reexport dos tipos gerados por `supabase gen types`
└── helpers.ts        mapeadores Row → DTO do domínio
```

## Regras

- **Sempre** passar pelos clients daqui. Nunca `createClient` ad-hoc.
- `server.ts` usa `cookies()` do `next/headers`.
- `client.ts` é singleton (hook `useSupabase()` em `hooks/`).
- `admin.ts` **só** é importado por Server Actions que passaram por `requireRole('admin')` ou por Edge Functions. ESLint regra: `no-restricted-imports` fora do diretório allowlist.
- Tipos gerados vivem em `src/types/supabase.ts`. Reexportados aqui para conveniência.

## Helpers sugeridos

- `fromDbPatient(row): Patient` — converte row em tipo de domínio.
- `toDbPatient(patient): PatientRow` — inverso.

Essas conversões mantêm o domínio limpo de detalhes do DB (ex.: snake_case).
