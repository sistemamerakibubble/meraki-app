# supabase/migrations/

SQL versionado. Aplicado sequencialmente pelo Supabase CLI.

## Nomeação

```
YYYYMMDDHHMM_<slug-kebab>.sql
```

Ex.: `202604161200_create_patients_table.sql`.

## Convenções

- Uma **mudança lógica** por arquivo. Criar tabela + seus índices + suas policies pode ir junto; CRUD de duas tabelas distintas não.
- Top do arquivo: comentário `-- purpose: ...` explicando o objetivo.
- Sempre `if not exists` / `if exists` para operações DDL (idempotência).
- RLS:
  ```sql
  alter table <t> enable row level security;
  create policy "..." on <t> for <cmd> using (...) with check (...);
  ```
- Índices nomeados: `idx_<tabela>_<colunas>`.
- FKs com `on delete <action>` explícito.

## Ordem sugerida (MVP)

1. `create_orgs_table`
2. `create_profiles_table` (+ trigger de sync com auth.users)
3. `create_roles_enum`
4. `create_patients_table`
5. `create_professionals_table`
6. `create_rooms_table`
7. `create_appointments_table` (+ exclusion constraint de conflito)
8. `create_clinical_notes_table`
9. `create_billings_table`
10. `create_inventory_items_table`
11. `create_supervisions_table`
12. `create_supervision_messages_table`
13. `create_library_tables`
14. `create_reminders_table`
15. `enable_realtime_channels` (adiciona tabelas ao `supabase_realtime` publication)

## Checklist antes de commitar

- [ ] Roda limpo em `supabase db reset`.
- [ ] Types regenerados e commitados.
- [ ] RLS habilitado (se aplicável).
- [ ] Policies cobrem SELECT, INSERT, UPDATE, DELETE.
- [ ] Seed atualizado se a tabela é necessária para dev.
