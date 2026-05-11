import type { Role } from '@/types/domain';

export const TEST_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const TEST_USER_IDS: Record<Role, string> = {
  admin: '00000000-0000-0000-0000-0000000000a1',
  medico: '00000000-0000-0000-0000-0000000000a2',
  supervisor: '00000000-0000-0000-0000-0000000000a3',
  recepcao: '00000000-0000-0000-0000-0000000000a4',
  psicoterapeuta: '00000000-0000-0000-0000-0000000000a5',
  psicopedagoga: '00000000-0000-0000-0000-0000000000a6',
  estagiario: '00000000-0000-0000-0000-0000000000a7',
  atendente: '00000000-0000-0000-0000-0000000000a8',
};

export const TEST_USER_EMAILS: Record<Role, string> = {
  admin: 'admin@meraki.test',
  medico: 'medico@meraki.test',
  supervisor: 'supervisor@meraki.test',
  recepcao: 'recepcao@meraki.test',
  psicoterapeuta: 'psicoterapeuta@meraki.test',
  psicopedagoga: 'psicopedagoga@meraki.test',
  estagiario: 'estagiario@meraki.test',
  atendente: 'atendente@meraki.test',
};

export const TEST_USER_PASSWORDS: Record<Role, string> = {
  admin: 'meraki-test-admin',
  medico: 'meraki-test-medico',
  supervisor: 'meraki-test-supervisor',
  recepcao: 'meraki-test-recepcao',
  psicoterapeuta: 'meraki-test-psicoterapeuta',
  psicopedagoga: 'meraki-test-psicopedagoga',
  estagiario: 'meraki-test-estagiario',
  atendente: 'meraki-test-atendente',
};
