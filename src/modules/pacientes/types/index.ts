export type { Patient, ClinicalNote } from '@/types/domain';
export type { PatientInput } from '@/modules/pacientes/schemas/patient';
export type { ClinicalNoteInput } from '@/modules/pacientes/schemas/clinical-note';

export type PatientStatus = 'ativo' | 'inativo' | 'todos';

export type PatientListItem = {
  id: string;
  fullName: string;
  birthdate: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  createdAt: string;
};

export type PatientTimelineEntry = {
  kind: 'note';
  id: string;
  createdAt: string;
  authorName: string | null;
  content: string;
};
