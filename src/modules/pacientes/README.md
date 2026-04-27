# modules/pacientes

Cadastro, prontuário e histórico de pacientes.

## Estrutura

```
pacientes/
├── components/
│   ├── PatientsList.tsx         Tabela com busca, total/ativos, paginação
│   ├── PatientsSearch.tsx       Input + select de status
│   ├── PatientRow.tsx           Linha (nome, nascimento, contato, ícones)
│   ├── PatientForm.tsx          Dialog criar/editar
│   ├── PatientDetail.tsx        Página /pacientes/[id]
│   ├── PatientHeader.tsx        Dados principais + ações
│   ├── PatientTimeline.tsx      Agendamentos + anotações
│   └── ClinicalNoteForm.tsx
├── actions/
│   ├── create-patient.ts
│   ├── update-patient.ts
│   ├── archive-patient.ts
│   └── add-clinical-note.ts
├── queries/
│   ├── searchPatients.ts
│   ├── countPatients.ts
│   ├── getPatient.ts
│   └── getPatientTimeline.ts
├── schemas/
│   ├── patient.ts
│   └── clinical-note.ts
└── types/index.ts
```

## Regras

- Arquivar = `deleted_at = now()`. Paciente "inativo" = `active = false` **e** sem `deleted_at`. Distinguir.
- Busca insensível a acento (extensão `unaccent` no Postgres + índice GIN).
- Telefone guardado normalizado (só dígitos); formatar ao exibir.
- Anotação clínica só o autor (ou admin) edita/deleta.
