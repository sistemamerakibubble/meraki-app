# supabase/seed/

Dados de desenvolvimento. Aplicados por `supabase db reset`.

## Estrutura

```
seed/
├── seed.sql           Entry point — incluído pelo supabase CLI
├── 01-orgs.sql
├── 02-profiles.sql    (cria usuários de teste com supabase.auth.admin + profiles)
├── 03-patients.sql
├── 04-professionals.sql
├── 05-appointments.sql
└── ...
```

## Regras

- Dados fictícios, sem PII real.
- Senhas dos usuários seed: `meraki-dev-<role>` (só em dev).
- Seeds idempotentes via `on conflict do nothing`.
- **Não** aplicar seed em produção.
