'use client';

import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  inviteUserSchema,
  type InviteUserInput,
} from '@/modules/configuracoes/schemas/invite-user';
import {
  inviteUserAction,
  type InviteUserResult,
} from '@/modules/configuracoes/actions/invite-user';
import { ROLE_LABELS } from '@/lib/constants/roles';
import { ROLES } from '@/types/domain';

export function InviteUserForm({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [invited, setInvited] = useState<{ email: string; password: string } | null>(null);

  const form = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: '', fullName: '', role: 'medico' },
  });

  const [state, formAction, pending] = useActionState<InviteUserResult | null, FormData>(
    inviteUserAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      setInvited({ email: state.data.email, password: state.data.tempPassword });
      form.reset({ email: '', fullName: '', role: 'medico' });
    }
  }, [state, form]);

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('email', data.email);
    fd.set('fullName', data.fullName);
    fd.set('role', data.role);
    startTransition(() => formAction(fd));
  });

  const copyPassword = async () => {
    if (!invited) return;
    await navigator.clipboard.writeText(invited.password);
    toast.success('Senha copiada.');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setInvited(null);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {invited ? (
          <>
            <DialogHeader>
              <DialogTitle>Usuário criado</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Entregue estas credenciais ao novo usuário. A senha só aparece uma vez.
              </p>
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-mono">{invited.email}</p>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-md border bg-muted/40 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Senha temporária</p>
                  <p className="font-mono">{invited.password}</p>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={copyPassword}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Peça para o usuário trocar a senha em &quot;Esqueci minha senha&quot;.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Fechar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Novo usuário</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Dra. Maria Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    {pending ? 'Criando...' : 'Criar usuário'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
