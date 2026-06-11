-- purpose: biblioteca digital (library_folders, library_files) + bucket privado 'library' + RLS.

-- ============================================================================
-- library_folders (árvore simples via parent_id)
-- ============================================================================
create table if not exists public.library_folders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  parent_id uuid references public.library_folders(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_library_folders_org on public.library_folders (org_id);
create index if not exists idx_library_folders_parent on public.library_folders (parent_id);

drop trigger if exists set_library_folders_updated_at on public.library_folders;
create trigger set_library_folders_updated_at
before update on public.library_folders
for each row execute function public.set_updated_at();

alter table public.library_folders enable row level security;

drop policy if exists "library_folders_select_same_org" on public.library_folders;
create policy "library_folders_select_same_org" on public.library_folders
  for select
  using (org_id = public.current_org_id());

drop policy if exists "library_folders_modify_team" on public.library_folders;
create policy "library_folders_modify_team" on public.library_folders
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'supervisor', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'supervisor', 'recepcao')
  );

-- ============================================================================
-- library_files
-- ============================================================================
create table if not exists public.library_files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  folder_id uuid references public.library_folders(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  storage_path text not null unique,
  size_bytes bigint not null check (size_bytes >= 0),
  mime_type text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_library_files_org on public.library_files (org_id);
create index if not exists idx_library_files_folder on public.library_files (folder_id, created_at desc);
create index if not exists idx_library_files_recent on public.library_files (org_id, created_at desc);

alter table public.library_files enable row level security;

drop policy if exists "library_files_select_same_org" on public.library_files;
create policy "library_files_select_same_org" on public.library_files
  for select
  using (org_id = public.current_org_id());

drop policy if exists "library_files_modify_team" on public.library_files;
create policy "library_files_modify_team" on public.library_files
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'supervisor', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'supervisor', 'recepcao')
  );

-- ============================================================================
-- Bucket de storage 'library' (privado)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'library',
  'library',
  false,
  26214400, -- 25 MB
  null
)
on conflict (id) do nothing;

-- ============================================================================
-- Policies de storage para o bucket 'library'
-- Path convention: <org_id>/<folder_id_or_root>/<uuid>-<slug>
-- Primeira path segment é o org_id do usuário → regra RLS é path prefix.
-- ============================================================================

-- SELECT (download): qualquer usuário da mesma org.
drop policy if exists "library_storage_select" on storage.objects;
create policy "library_storage_select" on storage.objects
  for select
  using (
    bucket_id = 'library'
    and (storage.foldername(name))[1] = (public.current_org_id())::text
  );

-- INSERT (upload): time pode enviar dentro da pasta da própria org.
drop policy if exists "library_storage_insert" on storage.objects;
create policy "library_storage_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'library'
    and (storage.foldername(name))[1] = (public.current_org_id())::text
    and public.current_user_role() in ('admin', 'medico', 'supervisor', 'recepcao')
  );

-- DELETE: mesmo do insert.
drop policy if exists "library_storage_delete" on storage.objects;
create policy "library_storage_delete" on storage.objects
  for delete
  using (
    bucket_id = 'library'
    and (storage.foldername(name))[1] = (public.current_org_id())::text
    and public.current_user_role() in ('admin', 'medico', 'supervisor', 'recepcao')
  );

-- UPDATE: idem (útil para renomear/mover no futuro).
drop policy if exists "library_storage_update" on storage.objects;
create policy "library_storage_update" on storage.objects
  for update
  using (
    bucket_id = 'library'
    and (storage.foldername(name))[1] = (public.current_org_id())::text
    and public.current_user_role() in ('admin', 'medico', 'supervisor', 'recepcao')
  );
