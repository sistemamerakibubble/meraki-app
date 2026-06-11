'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signInSchema } from '@/modules/auth/schemas/sign-in';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { routes } from '@/lib/constants/routes';

export type SignInResult = Result<null, { formError?: string; fieldErrors?: Record<string, string[]> }>;

export async function signInAction(_prev: SignInResult | null, formData: FormData): Promise<SignInResult> {
  const parsed = parseFormData(signInSchema, formData);

  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return err({ formError: 'E-mail ou senha inválidos' });
  }

  redirect(routes.dashboard);
}

export async function signIn(input: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<SignInResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return err({ formError: 'E-mail ou senha inválidos' });
  }

  return ok(null);
}
