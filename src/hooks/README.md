# src/hooks/

Hooks client-side **genéricos** (agnósticos de domínio).

## Candidatos

```
hooks/
├── useDebounce.ts
├── useMediaQuery.ts
├── useSupabase.ts         Singleton do client Supabase browser
├── useDisclosure.ts       { isOpen, open, close, toggle }
├── useMounted.ts
└── useCopyToClipboard.ts
```

## Regras

- Hooks específicos de módulo ficam em `modules/<X>/hooks/`.
- Todos em `"use client"` ou exportados de arquivos client-only.
- Preferir hooks "abandoned-safe" (limpam subscriptions/timeouts no unmount).
