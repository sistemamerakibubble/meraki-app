export const ROLES = [
  'admin',
  'medico',
  'psicoterapeuta',
  'psicopedagoga',
  'estagiario',
  'atendente',
  'supervisor',
  'recepcao',
] as const;
export type Role = (typeof ROLES)[number];

// Funções não-admin (úteis para gerenciar permissões — admin sempre tem tudo)
export const NON_ADMIN_ROLES = ROLES.filter((r): r is Exclude<Role, 'admin'> => r !== 'admin');
export type NonAdminRole = (typeof NON_ADMIN_ROLES)[number];

export type OrgId = string;
export type UserId = string;

export type Org = {
  id: OrgId;
  name: string;
  slug: string;
  createdAt: string;
};

export type Profile = {
  id: UserId;
  orgId: OrgId;
  fullName: string;
  role: Role;
  active: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionUser = {
  id: UserId;
  email: string;
  profile: Profile;
};

export type Patient = {
  id: string;
  orgId: OrgId;
  fullName: string;
  birthdate: string | null;
  phone: string | null;
  email: string | null;
  document: string | null;
  rg: string | null;
  nationality: string | null;
  birthplace: string | null;
  address: string | null;
  livesWith: string | null;
  mainComplaints: string | null;
  hadNeuropsychEvaluation: boolean | null;
  diagnosis: string | null;
  bestSessionPeriod: string | null;
  careType: string | null;
  notes: string | null;
  billingPlan: BillingPlan | null;
  packageAmountCents: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export const BILLING_PLANS = ['mensal', 'quinzenal'] as const;
export type BillingPlan = (typeof BILLING_PLANS)[number];

export type ClinicalNote = {
  id: string;
  patientId: string;
  authorId: UserId;
  authorName: string | null;
  content: string;
  createdAt: string;
};

export const APPOINTMENT_STATUSES = [
  'agendado',
  'confirmado',
  'realizado',
  'cancelado',
  'faltou',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_TYPES = ['pacote', 'reposicao', 'extra'] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export type Professional = {
  id: string;
  orgId: OrgId;
  profileId: UserId | null;
  fullName: string;
  specialty: string | null;
  councilNumber: string | null;
  active: boolean;
};

export type Room = {
  id: string;
  orgId: OrgId;
  name: string;
  isVirtual: boolean;
  active: boolean;
};

export type Appointment = {
  id: string;
  orgId: OrgId;
  patientId: string;
  patientName: string | null;
  professionalId: string;
  professionalName: string | null;
  roomId: string | null;
  roomName: string | null;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  confirmed: boolean;
  notes: string | null;
  recurrenceGroupId: string | null;
  type: AppointmentType;
  makeupForId: string | null;
  extraParticipant: string | null;
};

export const BILLING_TYPES = ['receita', 'despesa'] as const;
export type BillingType = (typeof BILLING_TYPES)[number];

export const BILLING_STATUSES = ['pendente', 'pago', 'cancelado'] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

export type BillingDerivedStatus = BillingStatus | 'atrasado';

export const BILLING_CATEGORIES = ['pacote', 'extra'] as const;
export type BillingCategory = (typeof BILLING_CATEGORIES)[number];

export const NF_STATUSES = ['pendente', 'emitida'] as const;
export type NfStatus = (typeof NF_STATUSES)[number];

export type Billing = {
  id: string;
  orgId: OrgId;
  patientId: string | null;
  patientName: string | null;
  appointmentId: string | null;
  type: BillingType;
  billingCategory: BillingCategory | null;
  description: string;
  amountCents: number;
  status: BillingStatus;
  derivedStatus: BillingDerivedStatus;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string | null;
  nfStatus: NfStatus;
  nfNumber: string | null;
  nfIssuedAt: string | null;
  chargeSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  orgId: OrgId;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  minQuantity: number;
  tag: string | null;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
};

export const SUPERVISION_STATUSES = [
  'pendente',
  'em_revisao',
  'concluida',
  'cancelada',
] as const;
export type SupervisionStatus = (typeof SUPERVISION_STATUSES)[number];

export type Supervision = {
  id: string;
  orgId: OrgId;
  patientId: string | null;
  patientName: string | null;
  professionalId: UserId;
  professionalName: string | null;
  supervisorId: UserId;
  supervisorName: string | null;
  title: string;
  status: SupervisionStatus;
  createdAt: string;
  updatedAt: string;
};

export type SupervisionMessage = {
  id: string;
  supervisionId: string;
  authorId: UserId;
  authorName: string | null;
  content: string;
  createdAt: string;
};

export type LibraryFolder = {
  id: string;
  orgId: OrgId;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LibraryFile = {
  id: string;
  orgId: OrgId;
  folderId: string | null;
  name: string;
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
  uploadedBy: UserId | null;
  uploaderName: string | null;
  createdAt: string;
};

export type Reminder = {
  id: string;
  orgId: OrgId;
  authorId: UserId;
  content: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PatientEvolution = {
  id: string;
  patientId: string;
  authorId: UserId;
  authorName: string | null;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientNote = {
  id: string;
  patientId: string;
  authorId: UserId;
  authorName: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};
