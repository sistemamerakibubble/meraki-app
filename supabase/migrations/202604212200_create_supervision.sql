-- purpose: supervisions (casos clínicos para revisão) + supervision_messages (chat).
-- Realtime habilitado para supervision_messages.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'supervision_status') then
    create type public.supervision_status as enum (
      'pendente',
      'em_revisao',
      'concluida',
      'cancelada'
    );
  end if;
end$$;

-- ============================================================================
-- supervisions
-- ============================================================================
create table if not exists public.supervisions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  patient_id uuid references public.patients(id) on delete set null,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  supervisor_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  status public.supervision_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_supervisions_org on public.supervisions (org_id, status);
create index if not exists idx_supervisions_participants on public.supervisions (professional_id, supervisor_id);

drop trigger if exists set_supervisions_updated_at on public.supervisions;
create trigger set_supervisions_updated_at
before update on public.supervisions
for each row execute function public.set_updated_at();

alter table public.supervisions enable row level security;

-- Leitura: participantes (profissional ou supervisor do caso) ou admin da org.
drop policy if exists "supervisions_select_participants" on public.supervisions;
create policy "supervisions_select_participants" on public.supervisions
  for select
  using (
    org_id = public.current_org_id()
    and (
      professional_id = auth.uid()
      or supervisor_id = auth.uid()
      or public.current_user_role() = 'admin'
    )
  );

-- Criação: profissional (o próprio solicitante) ou admin.
drop policy if exists "supervisions_insert_professional" on public.supervisions;
create policy "supervisions_insert_professional" on public.supervisions
  for insert
  with check (
    org_id = public.current_org_id()
    and (
      professional_id = auth.uid()
      or public.current_user_role() = 'admin'
    )
  );

-- Atualização: supervisor, solicitante ou admin.
drop policy if exists "supervisions_update_participants" on public.supervisions;
create policy "supervisions_update_participants" on public.supervisions
  for update
  using (
    org_id = public.current_org_id()
    and (
      professional_id = auth.uid()
      or supervisor_id = auth.uid()
      or public.current_user_role() = 'admin'
    )
  )
  with check (org_id = public.current_org_id());

-- ============================================================================
-- supervision_messages
-- ============================================================================
create table if not exists public.supervision_messages (
  id uuid primary key default gen_random_uuid(),
  supervision_id uuid not null references public.supervisions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_supervision_messages_thread
  on public.supervision_messages (supervision_id, created_at);

alter table public.supervision_messages enable row level security;

-- Leitura: quem pode ler a supervisão pode ler as mensagens.
drop policy if exists "supervision_messages_select_participants" on public.supervision_messages;
create policy "supervision_messages_select_participants" on public.supervision_messages
  for select
  using (
    exists (
      select 1 from public.supervisions s
      where s.id = supervision_messages.supervision_id
        and s.org_id = public.current_org_id()
        and (
          s.professional_id = auth.uid()
          or s.supervisor_id = auth.uid()
          or public.current_user_role() = 'admin'
        )
    )
  );

-- Inserção: somente participantes do caso, e author_id = auth.uid().
drop policy if exists "supervision_messages_insert_participants" on public.supervision_messages;
create policy "supervision_messages_insert_participants" on public.supervision_messages
  for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.supervisions s
      where s.id = supervision_messages.supervision_id
        and s.org_id = public.current_org_id()
        and (
          s.professional_id = auth.uid()
          or s.supervisor_id = auth.uid()
          or public.current_user_role() = 'admin'
        )
    )
  );

-- ============================================================================
-- Realtime: habilitar publicação para supervision_messages
-- ============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'supervision_messages'
  ) then
    alter publication supabase_realtime add table public.supervision_messages;
  end if;
end$$;
