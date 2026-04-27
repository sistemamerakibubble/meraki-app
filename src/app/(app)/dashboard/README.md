# /dashboard

Tela inicial pós-login. Consolida visão do dia.

## Dados

- `getTodayAppointmentsCount(orgId)` — atendimentos hoje (confirmados vs a confirmar).
- `getTodayRevenue(orgId)` — faturamento do dia + meta diária.
- `getPendingSupervisionsCount(orgId)` — pendências de supervisão.
- `getBillsDueTodayTotal(orgId)` — contas a pagar vencendo hoje.
- `getUpcomingAppointments(orgId, limit=10)` — tabela "Próximos atendimentos".
- `getWeeklyRevenueSeries(orgId)` — dados do chart.
- `getBirthdaysOfMonth(orgId)` — aniversariantes.
- `getLowStockItems(orgId)` — estoque baixo.
- `listReminders(userId)` — lembretes/post-its.

Cada um vive no seu módulo correspondente (`modules/dashboard/queries/` reexporta via barrel ou importa direto de cada módulo).

## Composição

`DashboardView` faz fetch em paralelo via `Promise.all` e renderiza em grid. Widgets individuais podem ser envolvidos em `<Suspense>` para streaming.
