-- purpose: incluir supervisions na publicação realtime para notificar mudanças de
-- status/criação e forçar replica identity full para RLS avaliar corretamente nos
-- payloads de realtime.

alter table public.supervision_messages replica identity full;
alter table public.supervisions replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'supervisions'
  ) then
    alter publication supabase_realtime add table public.supervisions;
  end if;
end$$;
