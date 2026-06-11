# Roadmap de entrega

## Fase 0 — Fundações (1 semana)

- [ ] Projeto Next 15 com TS strict, ESLint, Prettier, Husky.
- [ ] Tailwind + shadcn instalados.
- [ ] Supabase local (`supabase start`) e projeto cloud `meraki-dev`.
- [ ] Migration inicial: `orgs`, `profiles`, enums.
- [ ] Auth completo: login, logout, middleware, guarda de rotas.
- [ ] Layout autenticado com nav principal (mock links).
- [ ] Tela de login funcional.
- [ ] Pipeline CI (lint + typecheck + build).

**Critério de aceite**: usuário admin criado manualmente no Supabase consegue logar e ver dashboard vazio.

## Fase 1 — Pacientes (1 semana)

- [ ] Migration `patients`.
- [ ] CRUD completo (lista, detalhe, criar, editar, arquivar).
- [ ] Busca + paginação URL-state.
- [ ] Anotações clínicas básicas (`clinical_notes`).

## Fase 2 — Agenda (2 semanas)

- [ ] Migrations `professionals`, `rooms`, `appointments`.
- [ ] Visão semanal + diária.
- [ ] Criar / editar / cancelar agendamento.
- [ ] Filtros profissional / local / status.
- [ ] Validação de conflito (constraint + action).

## Fase 3 — Financeiro (1 semana)

- [ ] Migration `billings`.
- [ ] Cards de receita/despesa/lucro.
- [ ] Tabela de registros com filtros.
- [ ] Criar/editar/marcar como pago.

## Fase 4 — Acervo Técnico (1 semana)

- [ ] Migration `inventory_items`.
- [ ] CRUD + filtros + baixo estoque.
- [ ] Exportar CSV.

## Fase 5 — Supervisão (1.5 semana)

- [ ] Migrations `supervisions`, `supervision_messages`.
- [ ] Lista de casos + criar supervisão.
- [ ] Chat com Supabase Realtime.

## Fase 6 — Estudos / Biblioteca (1 semana)

- [ ] Migrations `library_folders`, `library_files`.
- [ ] Bucket `library` + policies.
- [ ] Upload / download / preview.
- [ ] Navegação por pastas.

## Fase 7 — Dashboard real (3 dias)

- [ ] Widgets consumindo dados reais.
- [ ] Chart de rendimento semanal.
- [ ] Aniversariantes, estoque baixo, lembretes.

## Fase 8 — Configurações (3 dias)

- [ ] Gestão de equipe (criar, editar papel, desativar).
- [ ] Convite por e-mail.
- [ ] Página de ajuda estática.

## Fase 9 — Hardening (1 semana)

- [ ] Revisão completa de RLS.
- [ ] Testes E2E dos fluxos críticos.
- [ ] Acessibilidade (axe).
- [ ] Performance (LCP, CLS).
- [ ] Sentry (opcional).

## Pós-MVP

- Notificações (e-mail/push) para lembrete de consulta.
- Portal do paciente (login próprio).
- Teleconsulta (integração com provider).
- Multi-tenant real com onboarding de nova org.
- App mobile (Expo).
