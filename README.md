# Meraki — Sistema de Gestão Clínica

> 🧭 **Antes de mexer em qualquer coisa, abra [PROJECT_MAP.md](PROJECT_MAP.md).** É o índice central do projeto: onde vive cada coisa, qual doc explica as regras, e links para a documentação oficial de cada ferramenta usada.
>
> 🚀 **Rodando pela primeira vez?** Siga [GETTING_STARTED.md](GETTING_STARTED.md).

Plataforma SaaS para gestão inteligente de clínicas de saúde e bem-estar. Reconstrução da aplicação originalmente desenvolvida em Bubble, agora em stack moderna, modular e escalável.

## Visão de produto

O Meraki atende clínicas multiprofissionais (psicólogos, fisioterapeutas, nutricionistas, médicos, etc.) com foco em:

- **Agendamento e agenda** — visões diária/semanal, múltiplos profissionais e salas.
- **Prontuários e pacientes** — cadastro, histórico, anotações clínicas.
- **Financeiro** — faturamento, pagamentos, despesas, contas a pagar.
- **Acervo técnico / estoque** — controle de suprimentos, alertas de baixo estoque.
- **Supervisão clínica** — revisão de casos entre profissional e supervisor via chat.
- **Estudos / biblioteca digital** — repositório de livros, artigos, protocolos e testes.
- **Configurações e equipe** — gestão de usuários, papéis e permissões.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions) — SSR/SSG + streaming.
- **TypeScript** estrito.
- **Supabase** — Postgres, Auth, Storage, Realtime, RLS.
- **shadcn/ui** + **Tailwind CSS** — design system e primitivas.
- **Zod** — validação de schemas (form, DTO, env).
- **React Hook Form** — formulários.
- **TanStack Query** — cache/estado de servidor no cliente quando necessário.
- **Vercel** — deploy e hosting.

Detalhes em [docs/stack.md](./docs/stack.md).

## Estrutura do repositório

```
meraki-99freelas/
├── docs/                 Documentação de arquitetura e decisões
├── src/
│   ├── app/              App Router (rotas, layouts, pages)
│   ├── components/       UI compartilhada (shadcn, layout, shared)
│   ├── modules/          Módulos de domínio (agenda, pacientes, etc.)
│   ├── lib/              Infra: supabase, validação, utils
│   ├── hooks/            Hooks genéricos
│   ├── types/            Tipos globais
│   └── config/           Configuração (env, feature flags)
├── supabase/             Migrations, policies RLS, seed
├── public/               Assets estáticos
└── tests/                Testes (unit, integration, e2e)
```

Cada pasta possui um `README.md` descrevendo responsabilidades, convenções e o que deve (e não deve) viver ali.

## Documentos-chave

- [ARCHITECTURE.md](./ARCHITECTURE.md) — visão macro e princípios.
- [docs/stack.md](./docs/stack.md) — tecnologias e justificativas.
- [docs/conventions.md](./docs/conventions.md) — padrões de código.
- [docs/data-model.md](./docs/data-model.md) — modelo de dados.
- [docs/auth.md](./docs/auth.md) — autenticação e autorização.
- [docs/modules.md](./docs/modules.md) — visão geral dos módulos de domínio.
- [docs/deployment.md](./docs/deployment.md) — deploy Vercel + Supabase.
- [docs/roadmap.md](./docs/roadmap.md) — fases de entrega.

## Princípios

1. **Modular por domínio**, não por tipo técnico.
2. **Server-first** — preferir Server Components e Server Actions; cliente só quando necessário (interatividade, realtime).
3. **RLS no banco** — segurança aplicada no Postgres, não só na aplicação.
4. **Contratos explícitos** — schemas Zod entre camadas.
5. **Zero monolito de componente** — se um componente passa de ~200 linhas, quebrar.
6. **Clean code** — nomes claros, funções pequenas, sem comentários redundantes.
