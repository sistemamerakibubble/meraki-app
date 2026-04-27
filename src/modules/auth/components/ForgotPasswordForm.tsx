'use client';

import Link from 'next/link';
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
  requestPasswordResetAction,
  type RequestResetResult,
} from '@/modules/auth/actions/request-password-reset';
import {
  requestResetSchema,
  type RequestResetInput,
} from '@/modules/auth/schemas/request-reset';
import { routes } from '@/lib/constants/routes';

export function ForgotPasswordForm() {
  const form = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  });

  const [state, formAction, pending] = useActionState<RequestResetResult | null, FormData>(
    requestPasswordResetAction,
    null,
  );

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('email', data.email);
    startTransition(() => formAction(fd));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Esqueci minha senha</CardTitle>
        <CardDescription>Enviaremos um link para seu e-mail.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
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

            {state?.ok ? (
              <p role="status" className="text-sm font-medium text-emerald-600">
                Se o e-mail existir, enviaremos instruções em instantes.
              </p>
            ) : null}
            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Enviando...' : 'Enviar link'}
            </Button>

            <div className="text-center">
              <Link href={routes.login} className="text-sm text-primary hover:underline">
                Voltar para o login
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
