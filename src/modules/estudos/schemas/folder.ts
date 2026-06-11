import { z } from 'zod';

export const folderSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(100, 'Máximo 100 caracteres'),
  parentId: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => v === null || z.string().uuid().safeParse(v).success, {
      message: 'Pasta pai inválida',
    }),
});

export type FolderInput = z.infer<typeof folderSchema>;
