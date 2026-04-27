# /configuracoes

Configurações da clínica e equipe. **Apenas `admin`**.

## Guarda

`page.tsx` (ou `layout.tsx` local) chama `requireRole('admin')`. Usuários sem permissão são redirecionados para `/dashboard`.

## Abas

- **Ajuda e Suporte** — página estática com links e FAQ.
- **Gerenciamento de Time** — CRUD de usuários da org.

## Dados (Gerenciamento de Time)

- `listTeamMembers(orgId, q)` — busca por nome ou e-mail.
- `getRoles()` — enum de papéis (constante).

## Ações

- "+ Novo Usuário" → Dialog com `<InviteUserForm />` (cria `auth.users` + `profiles` via action server-side com service role restrito a esse fluxo).
- Editar (lápis) → altera papel, ativo/inativo.
- Excluir (lixeira) → desativa (não deleta por segurança de histórico).
