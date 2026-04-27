import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lsaictnmyeasizfedlgv.supabase.co';
const SERVICE_ROLE = 'sb_secret_REDACTED';

const ORG_ID = '00000000-0000-0000-0000-000000000001';

const USERS = [
  {
    id: '00000000-0000-0000-0000-0000000000a1',
    email: 'admin@meraki.app',
    password: 'REDACTED_PASSWORD',
    fullName: 'Administrador',
    role: 'admin',
  },
  {
    id: '00000000-0000-0000-0000-0000000000a3',
    email: 'supervisor@meraki.app',
    password: 'REDACTED_PASSWORD',
    fullName: 'Dra. Supervisora',
    role: 'supervisor',
  },
];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureOrg() {
  const { error } = await admin
    .from('orgs')
    .upsert({ id: ORG_ID, name: 'Clínica Meraki', slug: 'meraki' }, { onConflict: 'id' });
  if (error) throw new Error(`org: ${error.message}`);
  console.log('✓ org criada/atualizada');
}

async function ensureUser(u) {
  // tenta criar; se já existe, busca id e segue
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { full_name: u.fullName },
  });

  let userId;
  if (createErr) {
    const msg = createErr.message ?? '';
    if (msg.toLowerCase().includes('already')) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = (list?.users ?? []).find((x) => x.email === u.email);
      if (!found) throw new Error(`user ${u.email} já existe mas não foi encontrado`);
      userId = found.id;
      // resetar senha
      await admin.auth.admin.updateUserById(userId, { password: u.password });
      console.log(`↺ ${u.email} já existia — senha resetada`);
    } else {
      throw new Error(`createUser ${u.email}: ${msg}`);
    }
  } else {
    userId = created.user.id;
    console.log(`✓ ${u.email} criado`);
  }

  const { error: profErr } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        org_id: ORG_ID,
        full_name: u.fullName,
        role: u.role,
        active: true,
      },
      { onConflict: 'id' },
    );
  if (profErr) throw new Error(`profile ${u.email}: ${profErr.message}`);
  console.log(`✓ profile ${u.email} (${u.role})`);
}

async function main() {
  await ensureOrg();
  for (const u of USERS) await ensureUser(u);
  console.log('\nseed completo.');
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
