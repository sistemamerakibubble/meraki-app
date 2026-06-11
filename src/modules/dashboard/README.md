# modules/dashboard

Agrega dados de múltiplos módulos para a home.

## Estrutura

```
dashboard/
├── components/
│   ├── DashboardView.tsx         Compõe widgets
│   ├── StatsRow.tsx              4 cards do topo
│   ├── UpcomingAppointments.tsx
│   ├── WeeklyRevenueChart.tsx    recharts
│   ├── BirthdaysCard.tsx
│   ├── LowStockCard.tsx
│   └── RemindersCard.tsx         Post-its com toggle done
├── queries/
│   └── getDashboardSummary.ts    Agrega chamadas às queries dos módulos
├── actions/
│   ├── create-reminder.ts
│   ├── toggle-reminder.ts
│   └── delete-reminder.ts
├── schemas/
│   └── reminder.ts
└── types/index.ts
```

## Regras

- O dashboard **pode** importar **queries** dos outros módulos (leitura). Reafirma: nunca importa componentes ou actions deles.
  - Exceção pragmática justificada por ser "tela agregadora". Ver [ADR futuro em docs/].
- `DashboardView` é Server Component; cada widget pode ser isolado em `<Suspense>` para streaming.
- Lembretes são CRUD próprio deste módulo (tabela `reminders`).
