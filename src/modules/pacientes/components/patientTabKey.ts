export type PatientTabKey = 'info' | 'sessoes' | 'evolucao' | 'documento' | 'notas';

export function parseTab(value?: string): PatientTabKey {
  switch (value) {
    case 'sessoes':
    case 'evolucao':
    case 'documento':
    case 'notas':
      return value;
    default:
      return 'info';
  }
}
