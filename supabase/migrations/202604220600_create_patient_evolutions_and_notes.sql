-- purpose: dados extras da página do paciente.
-- patient_evolutions: resumo periódico do tratamento (com resumo curto + conteúdo completo).
-- patient_notes: anotações avulsas (post-its sobre o paciente).

-- ============================================================================
-- patient_evolutions
-- ============================================================================
create table if not exists public.patient_evolutions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  summary text not null check (length(trim(summary)) > 0),
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_evolutions_patient
  on public.patient_evolutions (patient_id, created_at desc);

drop trigger if exists set_patient_evolutions_updated_at on public.patient_evolutions;
create trigger set_patient_evolutions_updated_at
before update on public.patient_evolutions
for each row execute function public.set_updated_at();

alter table public.patient_evolutions enable row level security;

-- Leitura: qualquer usuário da mesma org do paciente.
drop policy if exists "patient_evolutions_select_same_org" on public.patient_evolutions;
create policy "patient_evolutions_select_same_org" on public.patient_evolutions
  for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = patient_evolutions.patient_id
        and p.org_id = public.current_org_id()
    )
  );

-- Inserção/edição: admin ou médico.
drop policy if exists "patient_evolutions_modify_clinicians" on public.patient_evolutions;
create policy "patient_evolutions_modify_clinicians" on public.patient_evolutions
  for all
  using (
    (author_id = auth.uid() or public.current_user_role() = 'admin')
    and exists (
      select 1 from public.patients p
      where p.id = patient_evolutions.patient_id
        and p.org_id = public.current_org_id()
    )
  )
  with check (
    public.current_user_role() in ('admin', 'medico')
    and (author_id = auth.uid() or public.current_user_role() = 'admin')
    and exists (
      select 1 from public.patients p
      where p.id = patient_evolutions.patient_id
        and p.org_id = public.current_org_id()
    )
  );

-- ============================================================================
-- patient_notes (avulsa)
-- ============================================================================
create table if not exists public.patient_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_notes_patient
  on public.patient_notes (patient_id, created_at desc);

drop trigger if exists set_patient_notes_updated_at on public.patient_notes;
create trigger set_patient_notes_updated_at
before update on public.patient_notes
for each row execute function public.set_updated_at();

alter table public.patient_notes enable row level security;

drop policy if exists "patient_notes_select_same_org" on public.patient_notes;
create policy "patient_notes_select_same_org" on public.patient_notes
  for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = patient_notes.patient_id
        and p.org_id = public.current_org_id()
    )
  );

-- Time todo (admin/medico/recepcao) pode criar; autor ou admin pode editar/excluir.
drop policy if exists "patient_notes_insert_team" on public.patient_notes;
create policy "patient_notes_insert_team" on public.patient_notes
  for insert
  with check (
    author_id = auth.uid()
    and public.current_user_role() in ('admin', 'medico', 'recepcao')
    and exists (
      select 1 from public.patients p
      where p.id = patient_notes.patient_id
        and p.org_id = public.current_org_id()
    )
  );

drop policy if exists "patient_notes_modify_author_or_admin" on public.patient_notes;
create policy "patient_notes_modify_author_or_admin" on public.patient_notes
  for update using (
    (author_id = auth.uid() or public.current_user_role() = 'admin')
    and exists (
      select 1 from public.patients p
      where p.id = patient_notes.patient_id
        and p.org_id = public.current_org_id()
    )
  );

drop policy if exists "patient_notes_delete_author_or_admin" on public.patient_notes;
create policy "patient_notes_delete_author_or_admin" on public.patient_notes
  for delete using (
    (author_id = auth.uid() or public.current_user_role() = 'admin')
    and exists (
      select 1 from public.patients p
      where p.id = patient_notes.patient_id
        and p.org_id = public.current_org_id()
    )
  );
