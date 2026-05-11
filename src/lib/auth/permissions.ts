export const PERMISSIONS = [
  'patients.view',
  'patients.create',
  'patients.update',
  'patients.archive',
  'clinical_notes.view',
  'clinical_notes.create',
  'patient_evolutions.view',
  'patient_evolutions.modify',
  'patient_notes.modify',
  'documents.generate',
  'appointments.view',
  'appointments.modify',
  'financials.view',
  'financials.modify',
  'financials.delete',
  'inventory.view',
  'inventory.modify',
  'inventory.export',
  'supervisions.create',
  'supervisions.review',
  'library.view',
  'library.modify',
  'dashboard.view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type PermissionMap = Record<Permission, boolean>;

export const PERMISSION_GROUPS: Array<{
  title: string;
  permissions: Array<{ key: Permission; label: string }>;
}> = [
  {
    title: 'Pacientes',
    permissions: [
      { key: 'patients.view', label: 'Ver lista e detalhes' },
      { key: 'patients.create', label: 'Cadastrar paciente' },
      { key: 'patients.update', label: 'Editar dados do paciente' },
      { key: 'patients.archive', label: 'Arquivar paciente' },
      { key: 'clinical_notes.view', label: 'Ver histórico de sessões' },
      { key: 'clinical_notes.create', label: 'Registrar sessão clínica' },
      { key: 'patient_evolutions.view', label: 'Ver evolução periódica' },
      { key: 'patient_evolutions.modify', label: 'Criar/editar evolução' },
      { key: 'patient_notes.modify', label: 'Anotações avulsas (CRUD)' },
      { key: 'documents.generate', label: 'Gerar documento / laudo' },
    ],
  },
  {
    title: 'Agenda',
    permissions: [
      { key: 'appointments.view', label: 'Ver agenda' },
      { key: 'appointments.modify', label: 'Criar/editar agendamentos' },
    ],
  },
  {
    title: 'Financeiro',
    permissions: [
      { key: 'financials.view', label: 'Ver gestão financeira' },
      { key: 'financials.modify', label: 'Criar/editar lançamentos' },
      { key: 'financials.delete', label: 'Excluir lançamentos' },
    ],
  },
  {
    title: 'Acervo Técnico',
    permissions: [
      { key: 'inventory.view', label: 'Ver estoque' },
      { key: 'inventory.modify', label: 'Cadastrar/editar/excluir itens' },
      { key: 'inventory.export', label: 'Exportar CSV' },
    ],
  },
  {
    title: 'Supervisão',
    permissions: [
      { key: 'supervisions.create', label: 'Solicitar supervisão' },
      { key: 'supervisions.review', label: 'Revisar (atuar como supervisor)' },
    ],
  },
  {
    title: 'Estudos',
    permissions: [
      { key: 'library.view', label: 'Ver biblioteca' },
      { key: 'library.modify', label: 'Upload e organização' },
    ],
  },
  {
    title: 'Dashboard',
    permissions: [{ key: 'dashboard.view', label: 'Acessar dashboard' }],
  },
];

export function emptyPermissionMap(): PermissionMap {
  const map = {} as PermissionMap;
  for (const key of PERMISSIONS) map[key] = false;
  return map;
}

export function fullPermissionMap(): PermissionMap {
  const map = {} as PermissionMap;
  for (const key of PERMISSIONS) map[key] = true;
  return map;
}
