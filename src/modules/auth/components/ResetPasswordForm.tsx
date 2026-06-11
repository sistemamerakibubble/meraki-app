'use client';

import { startTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  updatePasswordAction,
  type UpdatePasswordResult,
} from '@/modules/auth/actions/update-password';
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from '@/modules/auth/schemas/update-password';

export function ResetPasswordForm() {
  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const [state, formAction, pending] = useActionState<UpdatePasswordResult | null, FormData>(
    updatePasswordAction,
    null,
  );

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('password', data.password);
    fd.set('confirmPassword', data.confirmPassword);
    startTransition(() => formAction(fd));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Redefinir senha</CardTitle>
        <CardDescription>Escolha uma nova senha.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme a nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
