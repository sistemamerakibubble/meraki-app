-- Seed de desenvolvimento local.
-- NUNCA aplicar em produção.

-- Org única de desenvolvimento
insert into public.orgs (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Clínica Meraki Dev', 'meraki-dev')
on conflict (id) do nothing;

-- Usuários de teste via auth.admin
-- Como o seed do Supabase roda antes do Auth estar exposto via CLI,
-- usamos insert direto em auth.users com password hash conhecido.
-- Senha de todos: meraki-dev-<role>  (ex.: meraki-dev-admin)
-- Hash bcrypt já pré-computado para "meraki-dev-admin":
-- (gerar os demais via `supabase auth users create` no ambiente real; no dev seed,
--  criamos um admin mínimo para destravar acesso via UI)

-- Placeholder: deixe este arquivo como ponto de extensão.
-- O fluxo recomendado é:
--   1) supabase db reset
--   2) supabase auth users create --email admin@meraki.dev --password meraki-dev-admin
--   3) rodar o INSERT abaixo substituindo o id retornado.
--
-- insert into public.profiles (id, org_id, full_name, role)
-- values ('<uuid retornado>', '00000000-0000-0000-0000-000000000001', 'Admin Dev', 'admin')
-- on conflict (id) do nothing;
