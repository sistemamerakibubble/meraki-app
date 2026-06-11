-- purpose: post-its / lembretes pessoais do dashboard.
-- Cada lembrete pertence a um autor (usuário). Usuário só vê os próprios.

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reminders_author on public.reminders (author_id, done, created_at desc);

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

alter table public.reminders enable row level security;

-- Usuário só vê os próprios.
drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own" on public.reminders
  for select
  using (author_id = auth.uid());

-- Usuário só modifica os próprios.
drop policy if exists "reminders_modify_own" on public.reminders;
create policy "reminders_modify_own" on public.reminders
  for all
  using (author_id = auth.uid())
  with check (author_id = auth.uid() and org_id = public.current_org_id());
