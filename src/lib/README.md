# src/lib/

Infraestrutura e utilitários puros. **Zero dependência de domínio.**

## Subpastas

```
lib/
├── supabase/      Clients (server, client, middleware), tipos, helpers.
├── auth/          Guards de rota (requireUser, requireRole, getCurrentProfile).
├── validation/    Validadores reutilizáveis (cpf, telefone, etc.), adapters Zod.
├── utils/         Utilitários puros: cn, money, dates, slug, debounce.
└── constants/     Constantes globais (ex.: timezone default, limites).
```

## Regras

- Funções **puras** quando possível; side-effects isolados em `supabase/`.
- Nada aqui fala de "paciente", "agenda" — só primitivos.
- Import livre entre subpastas de `lib/`, sem ciclos.
