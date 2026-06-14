import { z } from 'zod';
import { APPOINTMENT_MODALITIES, APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from '@/types/domain';

const uuid = z.string().uuid('ID inválido');

const truthy = z.union([z.literal('on'), z.literal('true'), z.boolean()]);

export const RECURRENCE_UNITS = ['day', 'week', 'month'] as const;
export type RecurrenceUnit = (typeof RECURRENCE_UNITS)[number];

export const appointmentSchema = z
  .object({
    patientId: z.string().optional().default(''),
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
    type: z.enum(APPOINTMENT_TYPES).optional().default('pacote'),
    makeupForId: z
      .string()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : null))
      .refine((v) => v === null || z.string().uuid().safeParse(v).success, {
        message: 'Agendamento original inválido',
      }),
    extraParticipant: z.string().max(200, 'Máximo 200 caracteres').optional().default(''),
    modality: z.enum(APPOINTMENT_MODALITIES).optional().nullable(),
    recurring: truthy
      .optional()
      .transform((v) => v === true || v === 'on' || v === 'true'),
    repeatEvery: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === '') return 1;
        const n = typeof v === 'string' ? Number.parseInt(v, 10) : v;
        return Number.isFinite(n) ? n : 1;
      })
      .pipe(z.number().int().min(1, 'Mínimo 1').max(52, 'Máximo 52')),
    repeatUnit: z.enum(RECURRENCE_UNITS).optional().default('week'),
    occurrences: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === '') return 8;
        const n = typeof v === 'string' ? Number.parseInt(v, 10) : v;
        return Number.isFinite(n) ? n : 8;
      })
      .pipe(z.number().int().min(1, 'Mínimo 1').max(104, 'Máximo 104')),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    path: ['endsAt'],
    message: 'Término deve ser após o início',
  });

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUSES);
export const appointmentModalitySchema = z.enum(APPOINTMENT_MODALITIES);
