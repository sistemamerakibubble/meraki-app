-- purpose: expande o cadastro de pacientes com dados pessoais adicionais
-- (RG, nacionalidade, naturalidade, endereço, com quem reside) e uma seção de
-- anamnese inicial (queixas, avaliação neuropsicológica, diagnóstico, período e
-- tipo de atendimento). Todos opcionais para não quebrar cadastros existentes.

alter table public.patients
  add column if not exists rg text,
  add column if not exists nationality text,
  add column if not exists birthplace text,
  add column if not exists address text,
  add column if not exists lives_with text,
  add column if not exists main_complaints text,
  add column if not exists had_neuropsych_evaluation boolean,
  add column if not exists diagnosis text,
  add column if not exists best_session_period text,
  add column if not exists care_type text;
