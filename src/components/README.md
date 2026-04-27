# src/components/

UI reutilizável **agnóstica de domínio**. Se o componente entende de "paciente" ou "agendamento", ele mora em `modules/<X>/components/`, não aqui.

## Subpastas

```
components/
├── ui/        Primitivas shadcn (Button, Input, Dialog, Table, Form, ...).
├── layout/    Estruturas de tela: AppShell, Header, SidebarNav, AuthShell.
└── shared/    Compostos cross-módulo: DataTable, EmptyState, Stat, PageHeader.
```

## Regras

- `ui/` é **copiado** pela CLI do shadcn (`npx shadcn@latest add ...`). Não editar comportamentos, apenas tokens quando necessário.
- `layout/` compõe `ui/`.
- `shared/` compõe `ui/` e pode compor `layout/`, mas nunca importa de `modules/`.
- Componentes daqui **não** fazem fetch. Dados vêm por props.
