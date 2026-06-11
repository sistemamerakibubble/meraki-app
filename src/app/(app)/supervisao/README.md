# /supervisao

Supervisão clínica — revisão de casos com chat em tempo real.

## Query params

- `professional` — filtro por profissional solicitante.
- `status` — `pendente` | `em_revisao` | `concluida`.
- `caso` — id da supervisão aberta (controla o painel de chat).

## Dados

- `listSupervisions({ orgId, filters })` — coluna esquerda.
- `getSupervision(id)` + `listMessages(supervisionId)` — painel direito.

## Realtime

Componente de chat subscreve canal `supervision:<id>` e aplica mensagens novas.

## Ações

- "Nova Supervisão" → Dialog com `<SupervisionForm />`.
- Clicar em caso → define `?caso=<id>`.
- Enviar mensagem → action `sendSupervisionMessage`.
- Mudar status → action `updateSupervisionStatus` (restrita a supervisor).
