'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ExpenseCategoryForm } from './ExpenseCategoryForm';
import { deleteExpenseCategoryAction } from '@/modules/financeiro/actions/expense-category';
import type { ExpenseCategory } from '@/types/domain';

type Props = { categories: ExpenseCategory[] };

export function ExpenseCategoriesManager({ categories }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Desativar esta categoria? Os lançamentos já existentes não serão afetados.')) return;
    setDeletingId(id);
    const result = await deleteExpenseCategoryAction(id);
    setDeletingId(null);
    if (!result.ok) toast.error('Não foi possível desativar a categoria.');
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Categorias de Despesa</h3>
        </div>
        <ExpenseCategoryForm
          mode={{ kind: 'create' }}
          trigger={
            <Button size="sm" variant="outline">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Nova categoria
            </Button>
          }
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Classifique suas despesas para visualizar onde o dinheiro está sendo gasto.
      </p>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Tag className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm font-medium">Nenhuma categoria cadastrada</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sugestões: Aluguel, Salários, Material de escritório, Impostos, Assinaturas
          </p>
          <ExpenseCategoryForm
            mode={{ kind: 'create' }}
            trigger={
              <Button size="sm" className="mt-3">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Criar primeira categoria
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  {cat.description ? (
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-1">
                <ExpenseCategoryForm
                  mode={{ kind: 'edit', category: cat }}
                  trigger={
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={deletingId === cat.id}
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Remover</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
