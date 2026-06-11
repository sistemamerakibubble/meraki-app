-- purpose: suporte a cobrança por pacote (mensal/quinzenal), sessões de
-- reposição e sessões extras, e rastreio de emissão de nota fiscal.
--
-- - patients ganha billing_plan + package_amount_cents (valor fixo do pacote).
-- - appointments ganha type (pacote/reposicao/extra), makeup_for_id (aponta
--   para o agendamento que faltou e está sendo reposto) e extra_participant
--   (texto livre para sessões extras com pais, escola, etc.).
-- - billings ganha billing_category (pacote/extra, só para receitas
--   vinculadas a paciente) e os campos de nota fiscal (nf_status, nf_number,
--   nf_issued_at).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'billing_plan') then
    create type public.billing_plan as enum ('mensal', 'quinzenal');
  end if;
  if not exists (select 1 from pg_type where typname = 'appointment_type') then
    create type public.appointment_type as enum ('pacote', 'reposicao', 'extra');
  end if;
  if not exists (select 1 from pg_type where typname = 'billing_category') then
    create type public.billing_category as enum ('pacote', 'extra');
  end if;
  if not exists (select 1 from pg_type where typname = 'nf_status') then
    create type public.nf_status as enum ('pendente', 'emitida');
  end if;
end$$;

-- ============================================================================
-- patients
-- ============================================================================
alter table public.patients
  add column if not exists billing_plan public.billing_plan,
  add column if not exists package_amount_cents integer check (package_amount_cents > 0);

-- ============================================================================
-- appointments
-- ============================================================================
alter table public.appointments
  add column if not exists type public.appointment_type not null default 'pacote',
  add column if not exists makeup_for_id uuid references public.appointments(id) on delete set null,
  add column if not exists extra_participant text;

create index if not exists idx_appointments_makeup_for on public.appointments (makeup_for_id)
  where makeup_for_id is not null;

-- ============================================================================
-- billings
-- ============================================================================
alter table public.billings
  add column if not exists billing_category public.billing_category,
  add column if not exists nf_status public.nf_status not null default 'pendente',
  add column if not exists nf_number text,
  add column if not exists nf_issued_at timestamptz;

create index if not exists idx_billings_nf_status on public.billings (org_id, nf_status);
