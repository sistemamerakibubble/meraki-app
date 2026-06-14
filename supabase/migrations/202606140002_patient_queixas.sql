-- purpose: campo jsonb para queixas e sintomas do cliente.
alter table public.patients
  add column if not exists dados_queixas jsonb;
