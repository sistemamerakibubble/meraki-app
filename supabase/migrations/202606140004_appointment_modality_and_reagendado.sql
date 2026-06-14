-- Adiciona modalidade de atendimento e status "reagendado"

-- Modalidade: presencial, online, externo
alter table public.appointments
  add column if not exists modality text
    check (modality in ('presencial', 'online', 'externo'));

-- Estende status para incluir "reagendado"
alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
    check (status in ('agendado', 'confirmado', 'realizado', 'cancelado', 'faltou', 'reagendado'));
