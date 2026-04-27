'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/constants/routes';

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(routes.login);
}
