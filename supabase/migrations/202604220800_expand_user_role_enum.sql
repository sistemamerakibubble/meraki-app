-- purpose: expandir o enum user_role para incluir novas funções profissionais.
-- IMPORTANTE: ALTER TYPE ... ADD VALUE não pode ser usado na mesma transação
-- que insere/usa o valor. Por isso esta migration é separada da que cria a
-- tabela role_permissions + seed.

alter type public.user_role add value if not exists 'psicoterapeuta';
alter type public.user_role add value if not exists 'psicopedagoga';
alter type public.user_role add value if not exists 'estagiario';
alter type public.user_role add value if not exists 'atendente';
