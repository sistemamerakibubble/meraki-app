# lib/utils/

Utilitários puros.

## Arquivos

```
utils/
├── cn.ts           clsx + tailwind-merge (vem com shadcn)
├── money.ts        formatBRL, centsToBRL, brlToCents
├── dates.ts        formatDate, formatDateTime, startOfWeekBR, etc.
├── slug.ts         slugify (remoção de acentos + kebab)
├── debounce.ts
├── paginate.ts     buildPaginationRange(page, total)
└── phone.ts        normalizePhone, formatPhone
```

## Regras

- Funções puras. Sem I/O. Sem estado.
- Testados em `<arquivo>.test.ts`.
- Locale padrão: `pt-BR`. Timezone padrão vem de `constants/`.
