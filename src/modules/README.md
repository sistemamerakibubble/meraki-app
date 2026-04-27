# src/modules/

**Domínios do produto.** Cada subpasta é um módulo autocontido.

## Anatomia padrão

```
modules/<nome>/
├── components/     Componentes visuais do domínio (listas, formulários, views).
├── actions/        Server Actions (mutations). "use server".
├── queries/        Data fetchers para Server Components.
├── schemas/        Zod schemas (input/output/DTO).
├── types/          Tipos derivados dos schemas + tipos do domínio.
├── hooks/          Hooks client-side específicos.
├── utils/          Funções puras do domínio.
└── README.md       Escopo, convenções, decisões locais.
```

Nem todo módulo precisa de todas as subpastas — criar sob demanda.

## Regras invioláveis

1. **Módulo não importa módulo.** Compartilhamento via `components/shared`, `lib/`, `types/`.
2. **Actions** sempre validam com Zod do próprio módulo.
3. **Queries** retornam tipos do próprio módulo (nunca "linha de tabela Supabase cru").
4. **Components** do módulo podem ser Server ou Client — preferir Server.

## Lista de módulos

- [`auth/`](./auth/README.md) — login, sessão, guards.
- [`dashboard/`](./dashboard/README.md) — agregados da home.
- [`agenda/`](./agenda/README.md) — agendamentos.
- [`pacientes/`](./pacientes/README.md) — prontuários.
- [`financeiro/`](./financeiro/README.md) — faturamento e despesas.
- [`acervo/`](./acervo/README.md) — estoque.
- [`supervisao/`](./supervisao/README.md) — revisão clínica + chat.
- [`estudos/`](./estudos/README.md) — biblioteca digital.
- [`configuracoes/`](./configuracoes/README.md) — time e ajustes.

Módulos auxiliares que podem nascer conforme a necessidade:

- `profissionais/` — se a gestão de profissionais crescer além do CRUD mínimo de Configurações.
- `salas/` — idem.
- `lembretes/` — se o CRUD de post-its virar feature própria (hoje mora em `dashboard/`).
