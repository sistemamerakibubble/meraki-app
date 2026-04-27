'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { inventoryItemSchema } from '@/modules/acervo/schemas/inventory-item';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type UpdateItemResult = Result<{ id: string }, FormError>;

export async function updateItemAction(
  id: string,
  _prev: UpdateItemResult | null,
  formData: FormData,
): Promise<UpdateItemResult> {
  const session = await requireUser();
  if (session.profile.role !== 'admin' && session.profile.role !== 'recepcao') {
    return err({ formError: 'Sem permissão para editar.' });
  }

  const parsed = parseFormData(inventoryItemSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('inventory_items')
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category || null,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      min_quantity: parsed.data.minQuantity,
      tag: parsed.data.tag || null,
    })
    .eq('id', id);

  if (error) return err({ formError: 'Não foi possível salvar.' });

  revalidatePath(routes.acervo);
  return ok({ id });
}
