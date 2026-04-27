# modules/configuracoes

Configurações da clínica e gestão de equipe. **Admin-only**.

## Estrutura

```
configuracoes/
├── components/
│   ├── SettingsView.tsx         Tabs (Ajuda / Time)
│   ├── HelpPanel.tsx            Conteúdo estático (markdown-like)
│   ├── TeamPanel.tsx            Busca + tabela
│   ├── TeamSearch.tsx
│   ├── TeamTable.tsx
│   ├── InviteUserForm.tsx       Dialog + envio de convite
│   └── EditUserForm.tsx         Dialog — altera role/status
├── actions/
│   ├── invite-user.ts           Usa service role restrito + envia e-mail
│   ├── update-user-role.ts
│   └── deactivate-user.ts
├── queries/
│   └── listTeamMembers.ts
├── schemas/
│   ├── invite-user.ts
│   └── update-user.ts
└── types/index.ts
```

## Regras

- `invite-user` é o **único** lugar do app que usa a Service Role Key (via edge function ou server action estritamente guardada por `requireRole('admin')`).
- "Excluir" na UI chama `deactivate-user` (soft). Deleção hard só via SQL administrativo.
- Colunas visíveis: Nome, E-mail, Função (badge com cor por role), Status (ativo/não), Ações.
