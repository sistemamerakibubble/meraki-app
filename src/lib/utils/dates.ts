import { format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? parseISO(value) : value;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? parseISO(value) : value;
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function startOfWeekBR(value: Date = new Date()): Date {
  return startOfWeek(value, { weekStartsOn: 0 });
}
