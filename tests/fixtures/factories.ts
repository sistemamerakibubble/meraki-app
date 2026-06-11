import type { Profile, Role } from '@/types/domain';
import { TEST_ORG_ID } from './users';

let counter = 0;
function uid(prefix = ''): string {
  counter += 1;
  return `${prefix}${String(counter).padStart(12, '0')}`;
}

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `00000000-0000-0000-0000-${uid()}`,
    orgId: overrides.orgId ?? TEST_ORG_ID,
    fullName: overrides.fullName ?? 'Profissional Teste',
    role: (overrides.role ?? 'medico') as Role,
    active: overrides.active ?? true,
    avatarUrl: overrides.avatarUrl ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}
