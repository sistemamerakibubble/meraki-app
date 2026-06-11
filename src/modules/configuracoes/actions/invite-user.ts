'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { err, ok, type Result } from '@/lib/validation/action-result';
import { parseFormData } from '@/lib/validation/parse-form-data';
import { inviteUserSchema } from '@/modules/configuracoes/schemas/invite-user';
import { routes } from '@/lib/constants/routes';
import type { Role } from '@/types/domain';

type FormError = { formError?: string; fieldErrors?: Record<string, string[]> };
export type InviteUserResult = Result<
  { id: string; email: string; tempPassword: string },
  FormError
>;

const CLINICAL_ROLES: readonly Role[] = [
  'admin',
  'medico',
  'psicoterapeuta',
  'psicopedagoga',
  'estagiario',
  'supervisor',
];

function generateTempPassword(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}

function specialtyFor(role: Role): string | null {
  switch (role) {
    case 'admin':
      return null;
    case 'medico':
      return 'Clínica Geral';
    case 'psicoterapeuta':
      return 'Psicoterapia';
    case 'psicopedagoga':
      return 'Psicopedagogia';
    case 'estagiario':
      return 'Estágio';
    case 'supervisor':
      return 'Supervisão clínica';
    default:
      return null;
  }
}

export async function inviteUserAction(
  _prev: InviteUserResult | null,
  formData: FormData,
): Promise<InviteUserResult> {
  const session = await requireRole('admin');

  const parsed = parseFormData(inviteUserSchema, formData);
  if (!parsed.success) {
    return err({ fieldErrors: parsed.error.flatten().fieldErrors });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return err({
      formError:
        'Service role não configurada. Defina SUPABASE_SERVICE_ROLE_KEY em .env.local.',
    });
  }

  const tempPassword = generateTempPassword();

  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });

  if (authErr || !created.user) {
    const message = authErr?.message ?? '';
    if (message.toLowerCase().includes('already')) {
      return err({ formError: 'Já existe um usuário com este e-mail.' });
    }
    return err({ formError: 'Não foi possível criar o usuário.' });
  }

  const { error: profileErr } = await admin.from('profiles').insert({
    id: created.user.id,
    org_id: session.profile.orgId,
    full_name: parsed.data.fullName,
    role: parsed.data.role,
    active: true,
  });

  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return err({ formError: 'Não foi possível criar o perfil do usuário.' });
  }

  if (CLINICAL_ROLES.includes(parsed.data.role)) {
    const { error: profErr } = await admin.from('professionals').insert({
      org_id: session.profile.orgId,
      profile_id: created.user.id,
      full_name: parsed.data.fullName,
      specialty: specialtyFor(parsed.data.role),
      active: true,
    });
    if (profErr) {
      // Não derruba o usuário — só loga. O admin pode criar o professional manualmente
      // ou usar o script de backfill. Mas isso é raro.
      console.error('Falha criando professional para novo usuário:', profErr.message);
    }
  }

  revalidatePath(routes.configuracoes);
  revalidatePath(routes.agenda);
  return ok({
    id: created.user.id,
    email: parsed.data.email,
    tempPassword,
  });
}
