# components/ui/

Primitivas do shadcn/ui. **Gerenciadas via CLI**:

```
npx shadcn@latest add button input form dialog table dropdown-menu
```

## Inventário esperado (MVP)

- `button`, `input`, `textarea`, `label`, `form`
- `dialog`, `sheet`, `popover`, `tooltip`
- `dropdown-menu`, `command` (combobox), `select`, `checkbox`, `switch`, `radio-group`
- `table`, `tabs`, `card`, `badge`, `avatar`, `separator`
- `calendar`, `date-picker`
- `toast` / `sonner`
- `skeleton`, `alert`, `alert-dialog`
- `scroll-area`

## Convenções

- **Não reescrever componentes do shadcn.** Customização via variantes (`cva`) ou tokens Tailwind.
- Um arquivo por componente, exatamente como gerado pelo shadcn.
- Atualizações da CLI são aplicadas via PR separado (nunca junto com feature).

## O que NÃO vai aqui

- Qualquer componente com lógica de negócio.
- Wrappers "nossos" — esses vão em `components/shared/`.
