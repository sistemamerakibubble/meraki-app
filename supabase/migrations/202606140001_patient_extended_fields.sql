-- purpose: campos estendidos de cliente — responsáveis, dados acadêmicos,
-- informações de saúde, medicamentos, atividades e rotina semanal.

alter table public.patients
  add column if not exists religiao_familia       text,
  add column if not exists irmaos                 text,
  add column if not exists quem_encaminhou        text,
  add column if not exists inicio_psicoterapia    date,
  add column if not exists responsavel_mae        jsonb,
  add column if not exists responsavel_pai        jsonb,
  add column if not exists dados_academicos       jsonb,
  add column if not exists dados_saude            jsonb,
  add column if not exists medicamentos           jsonb,
  add column if not exists atividades             text,
  add column if not exists rotina                 jsonb;
