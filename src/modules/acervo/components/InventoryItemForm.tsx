'use client';

import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  inventoryItemSchema,
  type InventoryItemInput,
} from '@/modules/acervo/schemas/inventory-item';
import {
  createItemAction,
  type CreateItemResult,
} from '@/modules/acervo/actions/create-item';
import {
  updateItemAction,
  type UpdateItemResult,
} from '@/modules/acervo/actions/update-item';
import type { InventoryItem } from '@/types/domain';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; item: InventoryItem };

type Props = {
  mode: Mode;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function defaultValues(mode: Mode): InventoryItemInput {
  if (mode.kind === 'edit') {
    return {
      name: mode.item.name,
      description: mode.item.description ?? '',
      category: mode.item.category ?? '',
      quantity: mode.item.quantity,
      unit: mode.item.unit,
      minQuantity: mode.item.minQuantity,
      tag: mode.item.tag ?? '',
    };
  }
  return {
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit: 'un',
    minQuantity: 0,
    tag: '',
  };
}

export function InventoryItemForm({ mode, trigger, open: controlledOpen, onOpenChange }: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const form = useForm<InventoryItemInput>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: defaultValues(mode),
  });

  useEffect(() => {
    if (open) form.reset(defaultValues(mode));
  }, [open, mode, form]);

  const isEdit = mode.kind === 'edit';
  const action = isEdit
    ? (prev: UpdateItemResult | null, fd: FormData) =>
        updateItemAction(mode.item.id, prev, fd)
    : createItemAction;

  type Combined = CreateItemResult | UpdateItemResult;
  const [state, formAction, pending] = useActionState<Combined | null, FormData>(action, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? 'Item atualizado.' : 'Item criado.');
      setOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isEdit]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('name', data.name);
    if (data.description) fd.set('description', data.description);
    if (data.category) fd.set('category', data.category);
    fd.set('quantity', String(data.quantity));
    fd.set('unit', data.unit);
    fd.set('minQuantity', String(data.minQuantity));
    if (data.tag) fd.set('tag', data.tag);
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar item' : 'Novo item'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Seringa 10ml" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Materiais, Livros..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta (tag)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Livro, Teste, Manual..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="un, caixas, folhas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
