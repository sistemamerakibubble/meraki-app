# supabase/

Fonte de verdade do schema do banco, policies RLS e seed.

## Subpastas

```
supabase/
├── migrations/      SQL versionado. Um arquivo por mudança lógica.
├── policies/        Policies RLS organizadas por tabela (opcional — pode viver junto da migration).
├── seed/            Dados de desenvolvimento.
├── functions/       Edge Functions (se houver).
└── config.toml      Config do Supabase local.
```

## Workflow

```bash
supabase start                         # sobe stack local
supabase migration new <slug>          # cria arquivo em migrations/
# edita SQL...
supabase db reset                      # reset local + aplica tudo + seed
supabase gen types typescript --local > src/types/supabase.ts
```

## Regras

- Migrations **nunca** são editadas após merge — criar nova.
- Todas as tabelas de domínio têm RLS habilitado.
- Toda migration deve ser testada com `supabase db reset` limpo antes do PR.
- Renomeações de coluna usam `alter table ... rename column`, não drop+create.
