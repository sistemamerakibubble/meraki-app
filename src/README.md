# src/

Código-fonte do aplicativo. A pasta é organizada por **camada técnica** (`app/`, `components/`, `lib/`) e **domínio** (`modules/`). Domínio guia a maior parte do trabalho — camadas técnicas são suporte.

## Árvore

```
src/
├── app/            Rotas Next (App Router) — pages, layouts, loading, error.
├── components/     UI reutilizável: ui (shadcn), layout, shared.
├── modules/        Domínios: auth, agenda, pacientes, financeiro, etc.
├── lib/            Infra: supabase, validação, utils, constantes.
├── hooks/          Hooks genéricos (ex.: useDebounce, useMediaQuery).
├── types/          Tipos globais (supabase gen types, enums cross-module).
├── config/         env.ts, feature flags, constantes de rota.
└── middleware.ts   Renovação de sessão + proteção de rotas.
```

## Regras de dependência

| De ↓ / Para → | app | modules | components | lib | hooks | types | config |
|---|---|---|---|---|---|---|---|
| app         | —   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| modules     | ❌  | ❌¹| ✅ | ✅ | ✅ | ✅ | ✅ |
| components  | ❌  | ❌ | ✅² | ✅ | ✅ | ✅ | ✅ |
| lib         | ❌  | ❌ | ❌ | ✅³| ❌ | ✅ | ✅ |

¹ Um módulo nunca importa outro. Se precisar, extraia para `components/shared` ou `lib/`.
² `components/ui` não importa `components/layout` nem `components/shared`.
³ `lib` pode reusar entre si desde que não crie ciclo.

Violações são pegas por ESLint (`eslint-plugin-boundaries`).

## Alias de import

`tsconfig.json` define `@/*` → `src/*`. Nunca use paths relativos longos (`../../../`).
