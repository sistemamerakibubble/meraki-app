-- purpose: tabela billings (receitas e despesas).
-- Valores armazenados em centavos (integer) para evitar problemas de float.
-- Status 'atrasado' NÃO é armazenado — é derivado em query quando due_date < today e status = 'pendente'.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'billing_type') then
    create type public.billing_type as enum ('receita', 'despesa');
  end if;
  if not exists (select 1 from pg_type where typname = 'billing_status') then
    create type public.billing_status as enum ('pendente', 'pago', 'cancelado');
  end if;
end$$;

create table if not exists public.billings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete restrict,
  patient_id uuid references public.patients(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  type public.billing_type not null,
  description text not null check (length(trim(description)) > 0),
  amount_cents integer not null check (amount_cents > 0),
  status public.billing_status not null default 'pendente',
  due_date date not null,
  paid_at timestamptz,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billings_org_due on public.billings (org_id, due_date);
create index if not exists idx_billings_org_status on public.billings (org_id, status);
create index if not exists idx_billings_patient on public.billings (patient_id);

drop trigger if exists set_billings_updated_at on public.billings;
create trigger set_billings_updated_at
before update on public.billings
for each row execute function public.set_updated_at();

alter table public.billings enable row level security;

drop policy if exists "billings_select_same_org" on public.billings;
create policy "billings_select_same_org" on public.billings
  for select
  using (org_id = public.current_org_id());

-- Escrita: admin ou recepção.
drop policy if exists "billings_write_admin_recep" on public.billings;
create policy "billings_write_admin_recep" on public.billings
  for all
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'recepcao')
  );
