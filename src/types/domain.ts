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

export type Responsavel = {
  nome?: string;
  nascimento?: string;
  escolaridade?: string;
  profissao?: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  email?: string;
};

export type DadosAcademicos = {
  escola?: string;
  endereco?: string;
  telefone?: string;
  desde?: string;
  turma?: string;
  turno?: string;
  tipoEscola?: string;
  email?: string;
  reprovas?: string;
  coordenador?: string;
  orientador?: string;
  mediador?: string;
  historico?: string;
  // Informações profissionais
  empresa?: string;
  enderecoEmpresa?: string;
  telefoneEmpresa?: string;
  cargo?: string;
  horarioTrabalho?: string;
  renda?: string;
  tempoCargo?: string;
  historicoProfissional?: string;
};

export type DadosSaude = {
  diagnosticos?: string;
  tratamentosAtuais?: string;
  atualizacoesTratamentos?: string;
  sono?: string;
};

export type Medicamento = {
  nome: string;
  dosagem?: string;
  inicio?: string;
  alteracao?: string;
};

export type RotinaItem = {
  segunda?: string;
  terca?: string;
  quarta?: string;
  quinta?: string;
  sexta?: string;
  sabado?: string;
  domingo?: string;
};

export type OutraQueixa = {
  id: string;
  data: string;
  texto: string;
};

export type Sintoma = {
  id: string;
  nome: string;
  inicio?: string;
  situacao?: string;
  frequencia?: string;
  intensidade?: string;
  observacoes?: string;
  statusFinal?: string;
};

export type AnaliseSintomas = {
  id: string;
  periodo: string;
  sintomas: Sintoma[];
};

export type DadosQueixas = {
  queixasIniciais?: string;
  outrasQueixas?: OutraQueixa[];
  analises?: AnaliseSintomas[];
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
  // Campos estendidos
  religiaoFamilia: string | null;
  irmaos: string | null;
  quemEncaminhou: string | null;
  inicioPsicoterapia: string | null;
  responsavelMae: Responsavel | null;
  responsavelPai: Responsavel | null;
  dadosAcademicos: DadosAcademicos | null;
  dadosSaude: DadosSaude | null;
  medicamentos: Medicamento[] | null;
  atividades: string | null;
  rotina: RotinaItem | null;
  dadosQueixas: DadosQueixas | null;
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
  'reagendado',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_MODALITIES = ['presencial', 'online', 'externo'] as const;
export type AppointmentModality = (typeof APPOINTMENT_MODALITIES)[number];

export const APPOINTMENT_MODALITY_LABELS: Record<AppointmentModality, string> = {
  presencial: 'Presencial',
  online: 'Online',
  externo: 'Atendimento externo',
};

export const EXTRA_PARTICIPANTS = [
  'medico',
  'terapeuta',
  'pai',
  'mae',
  'conjuge',
  'professor_coordenador',
] as const;
export type ExtraParticipant = (typeof EXTRA_PARTICIPANTS)[number];

export const EXTRA_PARTICIPANT_LABELS: Record<ExtraParticipant, string> = {
  medico: 'Médico(a)',
  terapeuta: 'Terapeuta',
  pai: 'Pai',
  mae: 'Mãe',
  conjuge: 'Cônjuge',
  professor_coordenador: 'Professor(a) / Coordenador(a)',
};

export const APPOINTMENT_TYPES = ['pacote', 'reposicao', 'extra', 'compromisso'] as const;
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
  patientId: string | null;
  patientName: string | null;
  title: string | null;
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
  makeupForDate: string | null;
  extraParticipant: string | null;
  modality: AppointmentModality | null;
};

export type ExpenseCategory = {
  id: string;
  orgId: OrgId;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export const EXPENSE_CATEGORY_PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#0ea5e9',
] as const;

export const PAYMENT_METHOD_TYPES = ['pix', 'cartao_credito', 'boleto', 'debito_conta'] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  pix: 'Pix',
  cartao_credito: 'Cartão de crédito',
  boleto: 'Boleto',
  debito_conta: 'Débito em conta',
};

export const RECURRENCE_TYPES = ['avulso', 'recorrente', 'parcelado'] as const;
export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export const ACCOUNT_TYPES = ['corrente', 'poupanca', 'pagamento'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  corrente: 'Conta corrente',
  poupanca: 'Poupança',
  pagamento: 'Conta de pagamento',
};

export type PaymentAccount = {
  id: string;
  orgId: OrgId;
  name: string;
  bankName: string | null;
  accountType: AccountType;
  agency: string | null;
  accountNumber: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreditCard = {
  id: string;
  orgId: OrgId;
  name: string;
  brand: string | null;
  lastFour: string | null;
  closingDay: number | null;
  dueDay: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
  paymentMethodType: PaymentMethodType | null;
  paymentAccountId: string | null;
  creditCardId: string | null;
  recurrenceType: RecurrenceType;
  recurrenceGroupId: string | null;
  installmentNumber: number | null;
  installmentCount: number | null;
  expenseCategoryId: string | null;
  notes: string | null;
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
