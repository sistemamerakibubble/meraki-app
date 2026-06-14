-- Adiciona tipo 'compromisso' para agendamentos sem paciente
-- e torna patient_id opcional

alter table public.appointments
  drop constraint if exists appointments_type_check;

alter table public.appointments
  add constraint appointments_type_check
    check (type in ('pacote', 'reposicao', 'extra', 'compromisso'));

-- Permite patient_id nulo (necessário para compromissos)
alter table public.appointments
  alter column patient_id drop not null;

-- Adiciona coluna título para compromissos
alter table public.appointments
  add column if not exists title text;
