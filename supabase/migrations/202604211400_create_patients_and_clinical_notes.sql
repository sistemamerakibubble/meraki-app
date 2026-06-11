-- purpose: cria tabelas patients e clinical_notes com RLS.
-- patients guarda o cadastro do paciente (com soft delete via deleted_at).
-- clinical_notes guarda anotações clínicas ligadas a um paciente.

-- ============================================================================
-- helper: unaccent IMMUTABLE para uso em índices de busca
-- ============================================================================
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
as $$
  select public.unaccent('public.unaccent', $1)
$$;

-- ============================================================================
-- patients
-- ============================================================================
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  full_name text not null check (length(trim(full_name)) > 0),
  birthdate date,
  phone text,
  email text,
  document text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_patients_org_id on public.patients (org_id);
create index if not exists idx_patients_active on public.patients (org_id, active) where deleted_at is null;
create index if not exists idx_patients_search
  on public.patients
  using gin (to_tsvector(
    'portuguese',
    public.immutable_unaccent(
      coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, '')
    )
  ));

drop trigger if exists set_patients_updated_at on public.patients;
create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

alter table public.patients enable row level security;

drop policy if exists "patients_select_same_org" on public.patients;
create policy "patients_select_same_org" on public.patients
  for select
  using (org_id = public.current_org_id());

drop policy if exists "patients_modify_same_org" on public.patients;
create policy "patients_modify_same_org" on public.patients
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'recepcao')
  );

-- ============================================================================
-- clinical_notes
-- ============================================================================
create table if not exists public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_clinical_notes_patient_id on public.clinical_notes (patient_id, created_at desc);
create index if not exists idx_clinical_notes_author_id on public.clinical_notes (author_id);

alter table public.clinical_notes enable row level security;

-- Leitura: qualquer usuário da mesma org do paciente.
drop policy if exists "clinical_notes_select_same_org" on public.clinical_notes;
create policy "clinical_notes_select_same_org" on public.clinical_notes
  for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = clinical_notes.patient_id
        and p.org_id = public.current_org_id()
    )
  );

-- Inserção: apenas admin ou médico, da mesma org.
drop policy if exists "clinical_notes_insert_clinicians" on public.clinical_notes;
create policy "clinical_notes_insert_clinicians" on public.clinical_notes
  for insert
  with check (
    author_id = auth.uid()
    and public.current_user_role() in ('admin', 'medico')
    and exists (
      select 1 from public.patients p
      where p.id = clinical_notes.patient_id
        and p.org_id = public.current_org_id()
    )
  );

-- Atualização/Exclusão: apenas o próprio autor ou admin.
drop policy if exists "clinical_notes_modify_author_or_admin" on public.clinical_notes;
create policy "clinical_notes_modify_author_or_admin" on public.clinical_notes
  for all
  using (
    (author_id = auth.uid() or public.current_user_role() = 'admin')
    and exists (
      select 1 from public.patients p
      where p.id = clinical_notes.patient_id
        and p.org_id = public.current_org_id()
    )
  )
  with check (
    (author_id = auth.uid() or public.current_user_role() = 'admin')
  );
