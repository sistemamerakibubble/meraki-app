import type { Role } from '@/types/domain';

export { ROLES } from '@/types/domain';
export type { Role } from '@/types/domain';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  medico: 'Médico',
  supervisor: 'Supervisor',
  recepcao: 'Recepção',
};
