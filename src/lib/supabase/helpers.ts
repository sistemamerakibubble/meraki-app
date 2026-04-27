import type { Database } from '@/types/supabase';
import type {
  Appointment,
  Billing,
  BillingDerivedStatus,
  ClinicalNote,
  InventoryItem,
  LibraryFile,
  LibraryFolder,
  Patient,
  PatientEvolution,
  PatientNote,
  Professional,
  Profile,
  Reminder,
  Room,
  Supervision,
  SupervisionMessage,
} from '@/types/domain';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PatientRow = Database['public']['Tables']['patients']['Row'];
type ClinicalNoteRow = Database['public']['Tables']['clinical_notes']['Row'];
type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];
type RoomRow = Database['public']['Tables']['rooms']['Row'];
type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type BillingRow = Database['public']['Tables']['billings']['Row'];

export function fromDbProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    orgId: row.org_id,
    fullName: row.full_name,
    role: row.role,
    active: row.active,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromDbPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    orgId: row.org_id,
    fullName: row.full_name,
    birthdate: row.birthdate,
    phone: row.phone,
    email: row.email,
    document: row.document,
    notes: row.notes,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function fromDbClinicalNote(
  row: ClinicalNoteRow & { profiles?: { full_name: string } | null },
): ClinicalNote {
  return {
    id: row.id,
    patientId: row.patient_id,
    authorId: row.author_id,
    authorName: row.profiles?.full_name ?? null,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function fromDbProfessional(row: ProfessionalRow): Professional {
  return {
    id: row.id,
    orgId: row.org_id,
    profileId: row.profile_id,
    fullName: row.full_name,
    specialty: row.specialty,
    councilNumber: row.council_number,
    active: row.active,
  };
}

export function fromDbRoom(row: RoomRow): Room {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    isVirtual: row.is_virtual,
    active: row.active,
  };
}

type PatientMini = { full_name: string } | null;
type ProfessionalMini = { full_name: string } | null;
type RoomMini = { name: string } | null;

function pick<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function fromDbAppointment(
  row: AppointmentRow & {
    patients?: PatientMini | PatientMini[];
    professionals?: ProfessionalMini | ProfessionalMini[];
    rooms?: RoomMini | RoomMini[];
  },
): Appointment {
  return {
    id: row.id,
    orgId: row.org_id,
    patientId: row.patient_id,
    patientName: pick(row.patients)?.full_name ?? null,
    professionalId: row.professional_id,
    professionalName: pick(row.professionals)?.full_name ?? null,
    roomId: row.room_id,
    roomName: pick(row.rooms)?.name ?? null,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    confirmed: row.confirmed,
    notes: row.notes,
  };
}

export function deriveBillingStatus(
  status: Billing['status'],
  dueDate: string,
  now: Date = new Date(),
): BillingDerivedStatus {
  if (status === 'pendente') {
    const due = new Date(dueDate + 'T23:59:59');
    if (due.getTime() < now.getTime()) return 'atrasado';
  }
  return status;
}

export function fromDbBilling(
  row: BillingRow & { patients?: { full_name: string } | { full_name: string }[] | null },
): Billing {
  const patient = pick(row.patients);
  return {
    id: row.id,
    orgId: row.org_id,
    patientId: row.patient_id,
    patientName: patient?.full_name ?? null,
    appointmentId: row.appointment_id,
    type: row.type,
    description: row.description,
    amountCents: row.amount_cents,
    status: row.status,
    derivedStatus: deriveBillingStatus(row.status, row.due_date),
    dueDate: row.due_date,
    paidAt: row.paid_at,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row'];

export function fromDbInventoryItem(
  row: InventoryItemRow,
): InventoryItem {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    description: row.description,
    category: row.category,
    quantity: row.quantity,
    unit: row.unit,
    minQuantity: row.min_quantity,
    tag: row.tag,
    lowStock: row.quantity <= row.min_quantity && row.min_quantity > 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type SupervisionRow = Database['public']['Tables']['supervisions']['Row'];
type SupervisionMessageRow = Database['public']['Tables']['supervision_messages']['Row'];

type Named = { full_name: string } | null;

export function fromDbSupervision(
  row: SupervisionRow & {
    patients?: Named | Named[];
    professional?: Named | Named[];
    supervisor?: Named | Named[];
  },
): Supervision {
  return {
    id: row.id,
    orgId: row.org_id,
    patientId: row.patient_id,
    patientName: pick(row.patients)?.full_name ?? null,
    professionalId: row.professional_id,
    professionalName: pick(row.professional)?.full_name ?? null,
    supervisorId: row.supervisor_id,
    supervisorName: pick(row.supervisor)?.full_name ?? null,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromDbSupervisionMessage(
  row: SupervisionMessageRow & { profiles?: Named | Named[] },
): SupervisionMessage {
  return {
    id: row.id,
    supervisionId: row.supervision_id,
    authorId: row.author_id,
    authorName: pick(row.profiles)?.full_name ?? null,
    content: row.content,
    createdAt: row.created_at,
  };
}

type LibraryFolderRow = Database['public']['Tables']['library_folders']['Row'];
type LibraryFileRow = Database['public']['Tables']['library_files']['Row'];

export function fromDbLibraryFolder(row: LibraryFolderRow): LibraryFolder {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    parentId: row.parent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromDbLibraryFile(
  row: LibraryFileRow & { profiles?: Named | Named[] },
): LibraryFile {
  return {
    id: row.id,
    orgId: row.org_id,
    folderId: row.folder_id,
    name: row.name,
    storagePath: row.storage_path,
    sizeBytes: row.size_bytes,
    mimeType: row.mime_type,
    uploadedBy: row.uploaded_by,
    uploaderName: pick(row.profiles)?.full_name ?? null,
    createdAt: row.created_at,
  };
}

type ReminderRow = Database['public']['Tables']['reminders']['Row'];

export function fromDbReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    orgId: row.org_id,
    authorId: row.author_id,
    content: row.content,
    done: row.done,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type PatientEvolutionRow = Database['public']['Tables']['patient_evolutions']['Row'];
type PatientNoteRow = Database['public']['Tables']['patient_notes']['Row'];

export function fromDbPatientEvolution(
  row: PatientEvolutionRow & { profiles?: Named | Named[] },
): PatientEvolution {
  return {
    id: row.id,
    patientId: row.patient_id,
    authorId: row.author_id,
    authorName: pick(row.profiles)?.full_name ?? null,
    title: row.title,
    summary: row.summary,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromDbPatientNote(
  row: PatientNoteRow & { profiles?: Named | Named[] },
): PatientNote {
  return {
    id: row.id,
    patientId: row.patient_id,
    authorId: row.author_id,
    authorName: pick(row.profiles)?.full_name ?? null,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
