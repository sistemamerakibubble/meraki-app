# /agenda

Agenda médica com visões diária e semanal.

## Query params (URL state)

- `view` — `dia` | `semana` (default: `semana`).
- `date` — ISO date do cursor (ex.: `2026-02-19`).
- `professional` — id do profissional (filtro).
- `room` — id da sala (filtro).
- `status` — enum de status do agendamento.

## Dados

- `listAppointmentsInRange({ orgId, start, end, filters })` — lista filtrada.
- `listProfessionals(orgId)` / `listRooms(orgId)` — selects de filtro.

## Ações

- "Novo agendamento" abre Dialog com `<AppointmentForm />`.
- Card de agendamento no grid abre Dialog com detalhe + edição.
- Botões de navegação (anterior/próximo/hoje) mudam `date` na URL.
