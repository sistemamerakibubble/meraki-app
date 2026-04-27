# components/shared/

Componentes compostos reutilizáveis entre módulos.

## Candidatos

### `DataTable<T>`
Wrapper sobre `@tanstack/react-table` + `ui/table`. Recebe `columns` e `data`, expõe sorting, paginação, empty state.

### `EmptyState`
Ícone + título + descrição + ação opcional. Usado quando listas vêm vazias.

### `StatCard`
Card de métrica do dashboard (label + número grande + descrição + ícone). Variantes: `default`, `success`, `warning`, `danger`.

### `PageHeader`
(ver `components/layout`) — export central aqui se preferir.

### `DateRangePicker`
Composição de dois `<DatePicker />` + atalhos (hoje, semana, mês). Usado em Financeiro e relatórios.

### `ConfirmDialog`
`<AlertDialog />` pronto para ações destrutivas (excluir, desativar).

### `FormError` / `FormActions`
Helpers para formulários longos — exibição de erro de action, agrupamento de botões.

### `Money`
Formata centavos → `R$ X,YZ`. Aceita locale.

### `DateTime`
Formata ISO → `dd/MM/yyyy HH:mm` com `date-fns/locale/ptBR`.

## Regras

- Zero dependência de domínio. Se um componente referencia "paciente", ele volta para `modules/pacientes/components/`.
- Props genéricas (`T extends ...`).
- Acessibilidade obrigatória.
