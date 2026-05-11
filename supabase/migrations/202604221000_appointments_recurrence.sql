-- purpose: suporte a agendamentos recorrentes.
-- recurrence_group_id agrupa todos os agendamentos da mesma série.
-- Quando NULL, é agendamento avulso (comportamento anterior).

alter table public.appointments
  add column if not exists recurrence_group_id uuid;

create index if not exists idx_appointments_recurrence_group
  on public.appointments (recurrence_group_id)
  where recurrence_group_id is not null;
