-- purpose: cria estrutura base de orgs, profiles, enum de papéis, trigger de updated_at,
--          função auxiliar `current_org_id()`, e RLS para ambas as tabelas.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- ============================================================================
-- enum de papéis
-- ============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'medico', 'supervisor', 'recepcao');
  end if;
end$$;

-- ============================================================================
-- trigger genérico de updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- orgs
-- ============================================================================
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.orgs enable row level security;

-- ============================================================================
-- profiles
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete restrict,
  full_name text not null,
  role public.user_role not null default 'medico',
  active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_org_id on public.profiles (org_id);
create index if not exists idx_profiles_role on public.profiles (role);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- ============================================================================
-- helpers
-- ============================================================================
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- RLS policies
-- ============================================================================

-- orgs: usuário lê apenas sua própria org; apenas admin modifica.
drop policy if exists "orgs_select_own" on public.orgs;
create policy "orgs_select_own" on public.orgs
  for select
  using (id = public.current_org_id());

drop policy if exists "orgs_modify_admin" on public.orgs;
create policy "orgs_modify_admin" on public.orgs
  for all
  using (id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (id = public.current_org_id() and public.current_user_role() = 'admin');

-- profiles: usuário lê perfis da mesma org.
drop policy if exists "profiles_select_same_org" on public.profiles;
create policy "profiles_select_same_org" on public.profiles
  for select
  using (org_id = public.current_org_id());

-- profiles: usuário atualiza o próprio perfil (exceto role, active, org_id — restringido via coluna).
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- profiles: admin da org pode inserir/atualizar/deletar qualquer profile da mesma org.
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all
  using (org_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'admin');
