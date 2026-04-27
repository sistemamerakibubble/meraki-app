# tests/

Testes de nível de projeto (E2E, integração ampla) + plano de cobertura em Markdown. Testes unitários e de componente moram **junto do código** (`<file>.test.ts(x)` ao lado do arquivo).

## Estrutura

```
tests/
├── README.md               Este arquivo — entry point.
├── STRATEGY.md             Pirâmide, ferramentas, padrões.
├── coverage/               Plano de cobertura por módulo (MDs).
│   ├── README.md           Índice.
│   ├── auth.md
│   ├── dashboard.md
│   ├── agenda.md
│   ├── pacientes.md
│   ├── financeiro.md
│   ├── acervo.md
│   ├── supervisao.md
│   ├── estudos.md
│   ├── configuracoes.md
│   └── lib.md
├── e2e/                    Playwright specs.
│   ├── README.md
│   ├── auth.spec.ts
│   ├── patients.spec.ts
│   ├── appointments.spec.ts
│   ├── billings.spec.ts
│   ├── inventory.spec.ts
│   ├── supervision.spec.ts
│   ├── library.spec.ts
│   ├── settings.spec.ts
│   └── dashboard.spec.ts
├── fixtures/               Helpers de dados para testes.
│   ├── README.md
│   ├── db.ts               setupTestDb / teardownTestDb
│   ├── factories.ts        makePatient, makeAppointment, etc.
│   └── users.ts            signInAs(role), TEST_USER_IDS
├── setup/                  Bootstrap da infra de teste.
│   ├── vitest.setup.ts
│   └── supabase-test.ts
├── playwright.config.ts
└── vitest.config.ts        (ou na raiz, dependendo da convenção)
```

## Leia primeiro

1. [STRATEGY.md](./STRATEGY.md) — princípios e ferramentas.
2. [coverage/README.md](./coverage/README.md) — como o plano é organizado.
3. Doc do módulo em que você vai mexer, em [coverage/](./coverage/).

## Como contribuir um teste

1. Identifique em qual MD de coverage ele se encaixa. Se não existe, acrescente lá primeiro.
2. Escreva o teste no lugar correto:
   - Unit/component → ao lado do arquivo, `<file>.test.ts(x)`.
   - Integration de action/query → idem, no módulo.
   - E2E → `tests/e2e/<fluxo>.spec.ts`.
3. Use fixtures e factories — não invente dados soltos.
4. Atualize o MD de coverage se novas superfícies passaram a existir.

## Comandos

```bash
pnpm test                   # unit + component
pnpm test:watch             # watch
pnpm test:int               # integration (precisa `supabase start`)
pnpm e2e                    # Playwright (precisa Supabase + next dev)
pnpm e2e --ui               # modo UI
pnpm typecheck              # tsc --noEmit
pnpm lint                   # eslint
```

## CI

- `lint` + `typecheck` + `test` + `build` em todo PR.
- `e2e` em ambiente efêmero (Supabase local via service container).
- Coverage reportada via Vitest, sem meta numérica dura.
