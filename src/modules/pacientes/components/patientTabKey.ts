export type PatientTabKey =
  | 'info'
  | 'academico'
  | 'saude'
  | 'medicacao'
  | 'queixas'
  | 'rotina'
  | 'agendamento'
  | 'registro'
  | 'sessoes'
  | 'evolucao'
  | 'documento'
  | 'notas';

export function parseTab(value?: string): PatientTabKey {
  switch (value) {
    case 'academico':
    case 'saude':
    case 'medicacao':
    case 'queixas':
    case 'rotina':
    case 'agendamento':
    case 'registro':
    case 'sessoes':
    case 'evolucao':
    case 'documento':
    case 'notas':
      return value;
    default:
      return 'info';
  }
}
