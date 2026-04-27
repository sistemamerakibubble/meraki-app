-- purpose: tabelas professionals, rooms, appointments.
-- appointments usa exclusion constraint (gist) para impedir sobreposição
-- de horários do mesmo profissional em agendamentos não-cancelados.

create extension if not exists btree_gist;

-- ============================================================================
-- enum de status de agendamento
-- ============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum (
      'agendado',
      'confirmado',
      'realizado',
      'cancelado',
      'faltou'
    );
  end if;
end$$;

-- ============================================================================
-- professionals
-- ============================================================================
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null check (length(trim(full_name)) > 0),
  specialty text,
  council_number text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, profile_id)
);

create index if not exists idx_professionals_org_id on public.professionals (org_id);

drop trigger if exists set_professionals_updated_at on public.professionals;
create trigger set_professionals_updated_at
before update on public.professionals
for each row execute function public.set_updated_at();

alter table public.professionals enable row level security;

drop policy if exists "professionals_select_same_org" on public.professionals;
create policy "professionals_select_same_org" on public.professionals
  for select using (org_id = public.current_org_id());

drop policy if exists "professionals_modify_admin" on public.professionals;
create policy "professionals_modify_admin" on public.professionals
  for all
  using (org_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'admin');

-- ============================================================================
-- rooms
-- ============================================================================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  is_virtual boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rooms_org_id on public.rooms (org_id);

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;

drop policy if exists "rooms_select_same_org" on public.rooms;
create policy "rooms_select_same_org" on public.rooms
  for select using (org_id = public.current_org_id());

drop policy if exists "rooms_modify_admin" on public.rooms;
create policy "rooms_modify_admin" on public.rooms
  for all
  using (org_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'admin');

-- ============================================================================
-- appointments
-- ============================================================================
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  room_id uuid references public.rooms(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'agendado',
  confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_appointments_org_time on public.appointments (org_id, starts_at);
create index if not exists idx_appointments_professional_time on public.appointments (professional_id, starts_at);
create index if not exists idx_appointments_patient on public.appointments (patient_id);
create index if not exists idx_appointments_room_time on public.appointments (room_id, starts_at);

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- Impede sobreposição no mesmo profissional em agendamentos não-cancelados.
alter table public.appointments drop constraint if exists appointments_no_overlap_professional;
alter table public.appointments
  add constraint appointments_no_overlap_professional
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status <> 'cancelado');

-- Também impede dois agendamentos ao mesmo tempo na mesma sala (quando sala existe).
alter table public.appointments drop constraint if exists appointments_no_overlap_room;
alter table public.appointments
  add constraint appointments_no_overlap_room
  exclude using gist (
    room_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status <> 'cancelado' and room_id is not null);

alter table public.appointments enable row level security;

drop policy if exists "appointments_select_same_org" on public.appointments;
create policy "appointments_select_same_org" on public.appointments
  for select using (org_id = public.current_org_id());

drop policy if exists "appointments_modify_same_org" on public.appointments;
create policy "appointments_modify_same_org" on public.appointments
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'medico', 'recepcao')
  );
