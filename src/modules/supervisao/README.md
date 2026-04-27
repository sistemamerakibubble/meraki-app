# modules/supervisao

Supervisão clínica — chat entre profissional e supervisor.

## Estrutura

```
supervisao/
├── components/
│   ├── SupervisionView.tsx      Grid 2 colunas (lista + chat)
│   ├── SupervisionList.tsx      Coluna esquerda com filtros
│   ├── SupervisionFilter.tsx    Select profissional
│   ├── SupervisionForm.tsx      Dialog "Nova Supervisão"
│   ├── ChatPanel.tsx            Client component — mensagens + input
│   ├── ChatMessage.tsx
│   └── ChatInput.tsx
├── actions/
│   ├── create-supervision.ts
│   ├── update-supervision-status.ts
│   └── send-supervision-message.ts
├── queries/
│   ├── listSupervisions.ts
│   ├── getSupervision.ts
│   └── listMessages.ts
├── hooks/
│   └── useRealtimeMessages.ts   subscribe ao canal supervision:<id>
├── schemas/
│   ├── supervision.ts
│   └── message.ts
└── types/index.ts
```

## Regras

- Mensagem é append-only — sem edição no MVP.
- Realtime via `supabase.channel('supervision:<id>').on('postgres_changes', ...)` + `.subscribe()`.
- Cancelar subscription no unmount (`useEffect` cleanup).
- Só o `supervisor` pode marcar `concluida`. Profissional solicitante pode cancelar.
- `author_id` é sempre o usuário logado (validado no servidor).
