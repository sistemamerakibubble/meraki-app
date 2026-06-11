import type { Role } from '@/types/domain';

export { ROLES, NON_ADMIN_ROLES } from '@/types/domain';
export type { Role, NonAdminRole } from '@/types/domain';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  medico: 'Médico',
  psicoterapeuta: 'Psicoterapeuta',
  psicopedagoga: 'Psicopedagoga',
  estagiario: 'Estagiário',
  atendente: 'Atendente',
  supervisor: 'Supervisor',
  recepcao: 'Recepção',
};
