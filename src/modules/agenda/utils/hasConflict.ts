import type { Appointment } from '@/types/domain';

type ConflictCandidate = {
  professionalId: string;
  startsAt: string;
  endsAt: string;
  excludeId?: string;
};

export function hasConflict(existing: Appointment[], candidate: ConflictCandidate): boolean {
  const start = new Date(candidate.startsAt).getTime();
  const end = new Date(candidate.endsAt).getTime();

  return existing.some((a) => {
    if (a.id === candidate.excludeId) return false;
    if (a.status === 'cancelado') return false;
    if (a.professionalId !== candidate.professionalId) return false;

    const aStart = new Date(a.startsAt).getTime();
    const aEnd = new Date(a.endsAt).getTime();
    return start < aEnd && end > aStart;
  });
}
