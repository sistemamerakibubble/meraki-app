# /pacientes

Lista e prontuário de pacientes.

## Rotas

- `/pacientes` → lista com busca e paginação.
- `/pacientes/[id]` → detalhe do paciente (dados + histórico).

## Query params (lista)

- `q` — busca por nome/e-mail/telefone.
- `status` — `ativo` | `inativo` | `todos`.
- `page` — paginação.

## Dados

- `searchPatients({ orgId, q, status, page })`.
- `countPatients({ orgId, status })` → total / ativos do header.
- `getPatient(id)` + `getPatientTimeline(id)` no detalhe.

## Ações

- "Novo Paciente" → Dialog com `<PatientForm />`.
- Linha da lista → link para `/pacientes/[id]`.
- No detalhe: editar dados, arquivar, adicionar anotação clínica.
