import 'server-only';

import { listAppointmentsInRange } from '@/modules/agenda/queries/listAppointmentsInRange';
import type { Appointment } from '@/types/domain';

export async function getUpcomingAppointments(limit = 8): Promise<Appointment[]> {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const items = await listAppointmentsInRange({ start: now, end });
  return items.filter((a) => a.status !== 'cancelado').slice(0, limit);
}
