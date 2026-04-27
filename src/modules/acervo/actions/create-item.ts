'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { inventoryItemSchema } from '@/modules/acervo/schemas/inventory-item';
import { routes } from '@/lib/constants/routes';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type CreateItemResult = Result<{ id: string }, FormError>;

export async function createItemAction(
  _prev: CreateItemResult | null,
  formData: FormData,
): Promise<CreateItemResult> {
  const session = await requireUser();
  if (session.profile.role !== 'admin' && session.profile.role !== 'recepcao') {
    return err({ formError: 'Sem permissão para criar itens.' });
  }

  const parsed = parseFormData(inventoryItemSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      org_id: session.profile.orgId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category || null,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      min_quantity: parsed.data.minQuantity,
      tag: parsed.data.tag || null,
    })
    .select('id')
    .single();

  if (error) return err({ formError: 'Não foi possível criar o item.' });

  revalidatePath(routes.acervo);
  return ok({ id: data.id });
}
