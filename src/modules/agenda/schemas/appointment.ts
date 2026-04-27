import { z } from 'zod';
import { APPOINTMENT_STATUSES } from '@/types/domain';

const uuid = z.string().uuid('ID inválido');

export const appointmentSchema = z
  .object({
    patientId: uuid,
    professionalId: uuid,
    roomId: z
      .string()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : null))
      .refine((v) => v === null || z.string().uuid().safeParse(v).success, {
        message: 'Sala inválida',
      }),
    startsAt: z
      .string({ required_error: 'Início é obrigatório' })
      .min(1, 'Início é obrigatório'),
    endsAt: z.string({ required_error: 'Término é obrigatório' }).min(1, 'Término é obrigatório'),
    notes: z.string().max(2000, 'Máximo 2000 caracteres').optional().default(''),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    path: ['endsAt'],
    message: 'Término deve ser após o início',
  });

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUSES);
