# Convenções de código

## Geral

- **Idioma do domínio**: português (nomes de entidades, rotas, labels). Ex.: `Paciente`, `Agendamento`, `Faturamento`, `agenda/`, `pacientes/`.
- **Idioma técnico**: inglês (variáveis, funções, hooks, tipos). Ex.: `getPatient`, `usePatientForm`, `AppointmentStatus`.
- **Arquivos**: `kebab-case.ts` para módulos, `PascalCase.tsx` para componentes.

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- Nunca `any`. Use `unknown` + narrowing.
- Tipos derivados de Zod via `z.infer<typeof schema>`.
- Evitar `interface` para objetos de domínio; preferir `type`.
- Enums substituídos por union literals: `type Role = 'admin' | 'medico' | 'recepcao'`.

## React / Next

- Server Component por padrão. `"use client"` apenas em componentes com evento, estado ou efeito.
- Server Actions residem em `modules/<X>/actions/` com `"use server"` no topo do arquivo.
- `async` Server Components podem fazer fetch direto; passar dados por props, não via context.
- Streaming via `loading.tsx` + Suspense.
- Error boundaries via `error.tsx` por segmento.
- Metadata via `generateMetadata` quando dinâmica.

## Imports

Ordem (ESLint enforça):

1. React/Next/externos
2. `@/lib/*`
3. `@/components/*`
4. `@/modules/*`
5. Relativos
6. Types (`import type`)

Alias `@/*` aponta para `src/*`.

## Componentes

- Um componente por arquivo. Nome do arquivo = nome do componente.
- Props sempre tipadas. Props complexas viram `type ComponentNameProps`.
- Evitar `default export` exceto em `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`.
- Componentes acima de ~200 linhas são um sinal — quebrar em subcomponentes.
- Não aceitar `children` "genérico" quando um slot nomeado comunica melhor a intenção.

## Formulários

- Sempre `react-hook-form` + `zodResolver`.
- Schema Zod vive em `modules/<X>/schemas/`.
- Componentes de input usam as primitivas `Form`, `FormField`, `FormItem` do shadcn.
- Submit chama Server Action; nunca fetch direto no `onSubmit`.

## Server Actions

- Sempre validar input com Zod no começo da action.
- Retornar objeto `{ ok: true, data } | { ok: false, error }` (nunca `throw` para erro esperado).
- Chamar `revalidateTag` / `revalidatePath` ao final de mutations.
- Nunca expor Service Role key — actions usam sessão do usuário.

## Data fetching

- Server: função assíncrona em `modules/<X>/queries/` retornando dados tipados.
- Cliente: `useQuery` com `queryKey` derivada do domínio. Nunca buscar via `useEffect + fetch`.
- Todo acesso ao Supabase passa por `lib/supabase/server.ts` ou `lib/supabase/client.ts` — nunca instanciar client ad-hoc.

## Error handling

- Erros de domínio são dados, não exceções. Retornar `Result<T, E>`.
- `throw` apenas para bugs (coisas que não deveriam acontecer).
- Exibir erros ao usuário via `sonner.error(...)` em mutations, via `error.tsx` em rotas.

## Acessibilidade

- Todo input tem `label`.
- Botões têm texto ou `aria-label`.
- Foco visível (Tailwind `focus-visible:` mantido).
- Contraste mínimo AA.

## Comentários

- Padrão: zero comentários.
- Comentar apenas o **porquê** não-óbvio (invariante, workaround, limitação externa).
- Nunca comentar o **o quê** — o código já diz.
- JSDoc só em APIs públicas de `lib/`.

## Git

- Branches: `feat/<escopo>`, `fix/<escopo>`, `chore/<escopo>`.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
- PRs pequenos, um escopo por PR.
- Squash merge.

## Testes

- Nome do arquivo: `<arquivo>.test.ts` ao lado do código testado.
- E2E: `tests/e2e/<fluxo>.spec.ts`.
- Não testar implementação, testar comportamento.
- Integration tests **não** mockam o Supabase local — sobem instância de teste.
