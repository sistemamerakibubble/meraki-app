import { z } from 'zod';

export const evolutionSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(1, 'Título é obrigatório')
    .max(200, 'Máximo 200 caracteres'),
  summary: z
    .string({ required_error: 'Resumo é obrigatório' })
    .min(1, 'Resumo é obrigatório')
    .max(500, 'Máximo 500 caracteres'),
  content: z
    .string({ required_error: 'Conteúdo é obrigatório' })
    .min(1, 'Conteúdo é obrigatório')
    .max(20_000, 'Máximo 20000 caracteres'),
});

export type EvolutionInput = z.infer<typeof evolutionSchema>;
