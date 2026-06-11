# Catálogo de módulos

Cada módulo é autocontido em `src/modules/<nome>/`. As rotas em `src/app/(app)/<nome>/` importam e compõem.

## auth
Login, logout, recuperação de senha, guarda de rotas. **Sem UI de cadastro público** — usuários são criados por admin.

- Rotas: `/login`, `/esqueci-senha`, `/redefinir-senha`.
- Actions: `signIn`, `signOut`, `requestPasswordReset`, `updatePassword`.
- Expõe: `requireUser`, `requireRole`, `getCurrentProfile`.

## dashboard
Visão geral da clínica no dia.

- Rota: `/dashboard`.
- Widgets: Atendimentos Hoje, Faturamento Dia, Pendências Supervisão, Contas a Pagar, Próximos atendimentos, Rendimento semanal (chart), Aniversariantes do Mês, Estoque Baixo, Lembretes/Post-its.
- Consulta cada módulo vizinho via **queries específicas** — não importa outros módulos diretamente.
- Lembretes têm CRUD próprio dentro do módulo.

## agenda
Agendamento de consultas.

- Rota: `/agenda`.
- Visões: Dia / Semana. Filtros: profissional, local, status.
- Ações: criar, editar, confirmar, cancelar agendamento.
- Regras: não permitir sobreposição no mesmo profissional+horário (validado em Action + check constraint no banco).
- Realtime opcional: atualizar grid ao criar em outra aba.

## pacientes
Prontuários e cadastro.

- Rotas: `/pacientes`, `/pacientes/[id]`.
- Lista com busca, total/ativos, paginação.
- Detalhe: dados pessoais, histórico de agendamentos, anotações clínicas, financeiro do paciente.
- Ações: criar, editar, arquivar (soft delete), anotar.

## financeiro
Faturamento, despesas e contas.

- Rota: `/financeiro`.
- Cards: Receita Total, Despesas, Lucro Líquido.
- Tabela de registros com filtros (período, status).
- Ações: novo faturamento, marcar como pago, editar, excluir.
- Integra com `pacientes` (via `patient_id`) e `agenda` (via `appointment_id`).

## acervo
Controle de estoque.

- Rota: `/acervo`.
- Filtros: busca por nome, categoria, apenas baixo estoque.
- Cards: Total de Itens, Estoque Baixo, Categorias.
- Tabela de itens com edição inline.
- Ações: novo item, editar, exportar CSV.

## supervisao
Revisão de casos entre profissional e supervisor.

- Rota: `/supervisao`.
- Lista de casos filtrável por profissional, com status (pendente, em revisão, concluída).
- Chat por supervisão usando Supabase Realtime.
- Ações: criar supervisão, enviar mensagem, mudar status.

## estudos
Biblioteca digital de materiais.

- Rota: `/estudos`.
- Pastas (livros, artigos, protocolos, testes) + drag-drop opcional.
- Lista de arquivos recentes com preview.
- Upload para Supabase Storage com URL assinada para download.
- Ações: criar pasta, upload, renomear, excluir.

## configuracoes
Configurações da clínica e equipe.

- Rota: `/configuracoes`.
- Abas: Ajuda e Suporte, Gerenciamento de Time.
- Gestão de usuários: criar (convida via e-mail), editar papel, desativar.
- Apenas `admin` acessa.

## Compartilhamento entre módulos

Se dois módulos precisam da mesma lógica/componente:

1. Se é **UI genérica** → `src/components/shared/`.
2. Se é **utilitário puro** → `src/lib/utils/`.
3. Se é **tipo de domínio** compartilhado → `src/types/`.
4. Se é **query leve** (ex.: listar profissionais para filtro) → duplicar a query pequena em cada módulo ou extrair para `src/lib/directory/` (catálogos).

**Nunca** `import from '@/modules/outro-modulo'`.
