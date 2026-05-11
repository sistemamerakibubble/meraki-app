-- purpose: sistema de permissões granulares por função.
-- - tabela role_permissions(org_id, role, permission_key, granted)
-- - função has_permission_for(role, key) e current_user_has_permission(key)
-- - seed inicial com defaults sensatos para cada função

-- ============================================================================
-- role_permissions
-- ============================================================================
create table if not exists public.role_permissions (
  org_id uuid not null references public.orgs(id) on delete cascade,
  role public.user_role not null,
  permission_key text not null check (length(trim(permission_key)) > 0),
  granted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (org_id, role, permission_key)
);

create index if not exists idx_role_permissions_lookup
  on public.role_permissions (org_id, role, permission_key) where granted = true;

drop trigger if exists set_role_permissions_updated_at on public.role_permissions;
create trigger set_role_permissions_updated_at
before update on public.role_permissions
for each row execute function public.set_updated_at();

alter table public.role_permissions enable row level security;

drop policy if exists "role_permissions_select_same_org" on public.role_permissions;
create policy "role_permissions_select_same_org" on public.role_permissions
  for select
  using (org_id = public.current_org_id());

drop policy if exists "role_permissions_modify_admin" on public.role_permissions;
create policy "role_permissions_modify_admin" on public.role_permissions
  for all
  using (org_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'admin');

-- ============================================================================
-- helpers: has_permission
-- ============================================================================

-- Checa se um (role, key) tem permissão na org atual. admin sempre true.
create or replace function public.has_permission_for(
  p_role public.user_role,
  p_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_role = 'admin' then true
    else exists (
      select 1 from public.role_permissions rp
      where rp.org_id = public.current_org_id()
        and rp.role = p_role
        and rp.permission_key = p_key
        and rp.granted = true
    )
  end
$$;

-- Checa se o usuário corrente tem permissão.
create or replace function public.current_user_has_permission(p_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_permission_for(public.current_user_role(), p_key)
$$;

-- ============================================================================
-- Seed defaults: para cada org existente, definir defaults por função.
-- Idempotente via on conflict.
-- ============================================================================

-- 'admin' não é populado na tabela — sempre passa por has_permission_for via case.

with permission_defaults as (
  -- (role, key, granted)
  select * from (values
    -- medico
    ('medico'::public.user_role, 'patients.view', true),
    ('medico', 'patients.create', true),
    ('medico', 'patients.update', true),
    ('medico', 'patients.archive', false),
    ('medico', 'clinical_notes.view', true),
    ('medico', 'clinical_notes.create', true),
    ('medico', 'patient_evolutions.view', true),
    ('medico', 'patient_evolutions.modify', true),
    ('medico', 'patient_notes.modify', true),
    ('medico', 'documents.generate', true),
    ('medico', 'appointments.view', true),
    ('medico', 'appointments.modify', true),
    ('medico', 'financials.view', false),
    ('medico', 'financials.modify', false),
    ('medico', 'financials.delete', false),
    ('medico', 'inventory.view', true),
    ('medico', 'inventory.modify', false),
    ('medico', 'inventory.export', false),
    ('medico', 'supervisions.create', true),
    ('medico', 'supervisions.review', false),
    ('medico', 'library.view', true),
    ('medico', 'library.modify', true),
    ('medico', 'dashboard.view', true),

    -- psicoterapeuta (similar a medico, sem patients.archive)
    ('psicoterapeuta', 'patients.view', true),
    ('psicoterapeuta', 'patients.create', true),
    ('psicoterapeuta', 'patients.update', true),
    ('psicoterapeuta', 'patients.archive', false),
    ('psicoterapeuta', 'clinical_notes.view', true),
    ('psicoterapeuta', 'clinical_notes.create', true),
    ('psicoterapeuta', 'patient_evolutions.view', true),
    ('psicoterapeuta', 'patient_evolutions.modify', true),
    ('psicoterapeuta', 'patient_notes.modify', true),
    ('psicoterapeuta', 'documents.generate', true),
    ('psicoterapeuta', 'appointments.view', true),
    ('psicoterapeuta', 'appointments.modify', true),
    ('psicoterapeuta', 'financials.view', false),
    ('psicoterapeuta', 'financials.modify', false),
    ('psicoterapeuta', 'financials.delete', false),
    ('psicoterapeuta', 'inventory.view', true),
    ('psicoterapeuta', 'inventory.modify', false),
    ('psicoterapeuta', 'inventory.export', false),
    ('psicoterapeuta', 'supervisions.create', true),
    ('psicoterapeuta', 'supervisions.review', false),
    ('psicoterapeuta', 'library.view', true),
    ('psicoterapeuta', 'library.modify', true),
    ('psicoterapeuta', 'dashboard.view', true),

    -- psicopedagoga (acesso de leitura amplo, sem criar prontuário)
    ('psicopedagoga', 'patients.view', true),
    ('psicopedagoga', 'patients.create', true),
    ('psicopedagoga', 'patients.update', true),
    ('psicopedagoga', 'patients.archive', false),
    ('psicopedagoga', 'clinical_notes.view', true),
    ('psicopedagoga', 'clinical_notes.create', false),
    ('psicopedagoga', 'patient_evolutions.view', true),
    ('psicopedagoga', 'patient_evolutions.modify', true),
    ('psicopedagoga', 'patient_notes.modify', true),
    ('psicopedagoga', 'documents.generate', false),
    ('psicopedagoga', 'appointments.view', true),
    ('psicopedagoga', 'appointments.modify', false),
    ('psicopedagoga', 'financials.view', false),
    ('psicopedagoga', 'financials.modify', false),
    ('psicopedagoga', 'financials.delete', false),
    ('psicopedagoga', 'inventory.view', true),
    ('psicopedagoga', 'inventory.modify', false),
    ('psicopedagoga', 'inventory.export', false),
    ('psicopedagoga', 'supervisions.create', false),
    ('psicopedagoga', 'supervisions.review', false),
    ('psicopedagoga', 'library.view', true),
    ('psicopedagoga', 'library.modify', false),
    ('psicopedagoga', 'dashboard.view', true),

    -- estagiario (acesso restrito: vê pacientes e cria, sem prontuário/financeiro)
    ('estagiario', 'patients.view', true),
    ('estagiario', 'patients.create', true),
    ('estagiario', 'patients.update', false),
    ('estagiario', 'patients.archive', false),
    ('estagiario', 'clinical_notes.view', false),
    ('estagiario', 'clinical_notes.create', false),
    ('estagiario', 'patient_evolutions.view', false),
    ('estagiario', 'patient_evolutions.modify', false),
    ('estagiario', 'patient_notes.modify', true),
    ('estagiario', 'documents.generate', false),
    ('estagiario', 'appointments.view', true),
    ('estagiario', 'appointments.modify', false),
    ('estagiario', 'financials.view', false),
    ('estagiario', 'financials.modify', false),
    ('estagiario', 'financials.delete', false),
    ('estagiario', 'inventory.view', true),
    ('estagiario', 'inventory.modify', false),
    ('estagiario', 'inventory.export', false),
    ('estagiario', 'supervisions.create', false),
    ('estagiario', 'supervisions.review', false),
    ('estagiario', 'library.view', true),
    ('estagiario', 'library.modify', false),
    ('estagiario', 'dashboard.view', true),

    -- atendente (operacional: pacientes, agenda)
    ('atendente', 'patients.view', true),
    ('atendente', 'patients.create', true),
    ('atendente', 'patients.update', true),
    ('atendente', 'patients.archive', false),
    ('atendente', 'clinical_notes.view', false),
    ('atendente', 'clinical_notes.create', false),
    ('atendente', 'patient_evolutions.view', false),
    ('atendente', 'patient_evolutions.modify', false),
    ('atendente', 'patient_notes.modify', true),
    ('atendente', 'documents.generate', false),
    ('atendente', 'appointments.view', true),
    ('atendente', 'appointments.modify', true),
    ('atendente', 'financials.view', false),
    ('atendente', 'financials.modify', false),
    ('atendente', 'financials.delete', false),
    ('atendente', 'inventory.view', true),
    ('atendente', 'inventory.modify', false),
    ('atendente', 'inventory.export', false),
    ('atendente', 'supervisions.create', false),
    ('atendente', 'supervisions.review', false),
    ('atendente', 'library.view', true),
    ('atendente', 'library.modify', false),
    ('atendente', 'dashboard.view', true),

    -- supervisor (revisor clínico)
    ('supervisor', 'patients.view', true),
    ('supervisor', 'patients.create', false),
    ('supervisor', 'patients.update', false),
    ('supervisor', 'patients.archive', false),
    ('supervisor', 'clinical_notes.view', true),
    ('supervisor', 'clinical_notes.create', false),
    ('supervisor', 'patient_evolutions.view', true),
    ('supervisor', 'patient_evolutions.modify', false),
    ('supervisor', 'patient_notes.modify', true),
    ('supervisor', 'documents.generate', false),
    ('supervisor', 'appointments.view', true),
    ('supervisor', 'appointments.modify', false),
    ('supervisor', 'financials.view', false),
    ('supervisor', 'financials.modify', false),
    ('supervisor', 'financials.delete', false),
    ('supervisor', 'inventory.view', true),
    ('supervisor', 'inventory.modify', false),
    ('supervisor', 'inventory.export', false),
    ('supervisor', 'supervisions.create', false),
    ('supervisor', 'supervisions.review', true),
    ('supervisor', 'library.view', true),
    ('supervisor', 'library.modify', true),
    ('supervisor', 'dashboard.view', true),

    -- recepcao (operacional: pacientes, agenda, financeiro)
    ('recepcao', 'patients.view', true),
    ('recepcao', 'patients.create', true),
    ('recepcao', 'patients.update', true),
    ('recepcao', 'patients.archive', false),
    ('recepcao', 'clinical_notes.view', false),
    ('recepcao', 'clinical_notes.create', false),
    ('recepcao', 'patient_evolutions.view', false),
    ('recepcao', 'patient_evolutions.modify', false),
    ('recepcao', 'patient_notes.modify', true),
    ('recepcao', 'documents.generate', false),
    ('recepcao', 'appointments.view', true),
    ('recepcao', 'appointments.modify', true),
    ('recepcao', 'financials.view', true),
    ('recepcao', 'financials.modify', true),
    ('recepcao', 'financials.delete', false),
    ('recepcao', 'inventory.view', true),
    ('recepcao', 'inventory.modify', true),
    ('recepcao', 'inventory.export', true),
    ('recepcao', 'supervisions.create', false),
    ('recepcao', 'supervisions.review', false),
    ('recepcao', 'library.view', true),
    ('recepcao', 'library.modify', true),
    ('recepcao', 'dashboard.view', true)
  ) as t(role, key, granted)
)
insert into public.role_permissions (org_id, role, permission_key, granted)
select o.id, pd.role, pd.key, pd.granted
from public.orgs o
cross join permission_defaults pd
on conflict (org_id, role, permission_key) do nothing;
