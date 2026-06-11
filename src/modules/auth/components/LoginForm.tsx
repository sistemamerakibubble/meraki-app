'use client';

import Link from 'next/link';
import { startTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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

import { signInAction, type SignInResult } from '@/modules/auth/actions/sign-in';
import { signInSchema, type SignInInput } from '@/modules/auth/schemas/sign-in';
import { routes } from '@/lib/constants/routes';

export function LoginForm() {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const [state, formAction, pending] = useActionState<SignInResult | null, FormData>(
    signInAction,
    null,
  );

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set('email', data.email);
    fd.set('password', data.password);
    if (data.rememberMe) fd.set('rememberMe', 'on');
    startTransition(() => formAction(fd));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Entrar</CardTitle>
        <CardDescription>Use seu e-mail e senha.</CardDescription>
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
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Manter conectado</FormLabel>
                </FormItem>
              )}
            />

            {state && !state.ok && state.error.formError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error.formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>

            <div className="text-center">
              <Link href={routes.forgotPassword} className="text-sm text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
