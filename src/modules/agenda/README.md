# modules/agenda

Agendamentos (consultas).

## Estrutura

```
agenda/
├── components/
│   ├── AgendaView.tsx           Entry point — orquestra toolbar + grid
│   ├── AgendaToolbar.tsx        Filtros, botões hoje/anterior/próximo, view switch
│   ├── WeekGrid.tsx             7 colunas (Qui..Qua conforme cursor)
│   ├── DayGrid.tsx              Coluna única, slots 30 min
│   ├── AppointmentCard.tsx      Card clicável no grid
│   ├── AppointmentForm.tsx      Criação/edição em Dialog
│   └── AppointmentDetail.tsx    Detalhe read-only + ações
├── actions/
│   ├── create-appointment.ts
│   ├── update-appointment.ts
│   ├── cancel-appointment.ts
│   └── confirm-appointment.ts
├── queries/
│   ├── listAppointmentsInRange.ts
│   ├── listProfessionals.ts
│   └── listRooms.ts
├── schemas/
│   └── appointment.ts
├── hooks/
│   └── useAgendaCursor.ts       Lê date + view do URL, calcula range
├── utils/
│   ├── buildWeekRange.ts        date-fns: segunda→domingo ou cursor±
│   └── hasConflict.ts           Valida sobreposição no client antes de submit
└── types/index.ts
```

## Regras

- Source of truth do status: `status` enum. `confirmed` é um boolean derivado do visual "sim/não".
- Validação de conflito **também** no banco (exclusion constraint sobre `(professional_id, tstzrange(starts_at, ends_at))`).
- Navegação temporal pela URL: `?date=YYYY-MM-DD&view=semana`.
- Realtime opcional pós-MVP: canal `appointments:org-<id>`.
