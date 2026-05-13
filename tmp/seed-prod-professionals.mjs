import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lsaictnmyeasizfedlgv.supabase.co';
const SERVICE_ROLE = 'sb_secret_Q-2cF0NHEj-neQ92AloHrg_HBdHOiwW';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Backfill: para cada profile com role clínica que ainda não tem entrada em professionals, criar uma.
const CLINICAL_ROLES = ['medico', 'psicoterapeuta', 'psicopedagoga', 'estagiario', 'supervisor'];

async function backfillProfessionals() {
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, org_id, full_name, role')
    .eq('active', true)
    .in('role', CLINICAL_ROLES);

  if (error) {
    console.error('erro buscando profiles:', error.message);
    return;
  }

  for (const p of profiles ?? []) {
    const { data: existing } = await admin
      .from('professionals')
      .select('id')
      .eq('profile_id', p.id)
      .maybeSingle();

    if (existing) {
      console.log(`= profissional já existe para ${p.full_name}`);
      continue;
    }

    const { error: insErr } = await admin.from('professionals').insert({
      org_id: p.org_id,
      profile_id: p.id,
      full_name: p.full_name,
      specialty: roleToSpecialty(p.role),
      active: true,
    });
    if (insErr) console.error(`× ${p.full_name}: ${insErr.message}`);
    else console.log(`✓ profissional criado: ${p.full_name} (${p.role})`);
  }
}

function roleToSpecialty(role) {
  switch (role) {
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

// 2. Salas padrão por org
async function seedRooms() {
  const { data: orgs } = await admin.from('orgs').select('id, name');
  for (const org of orgs ?? []) {
    const defaultRooms = [
      { name: 'Consultório 01', is_virtual: false },
      { name: 'Consultório 02', is_virtual: false },
      { name: 'Online', is_virtual: true },
    ];
    for (const r of defaultRooms) {
      const { data: existing } = await admin
        .from('rooms')
        .select('id')
        .eq('org_id', org.id)
        .eq('name', r.name)
        .maybeSingle();
      if (existing) {
        console.log(`= sala já existe: ${r.name} em ${org.name}`);
        continue;
      }
      const { error } = await admin.from('rooms').insert({
        org_id: org.id,
        name: r.name,
        is_virtual: r.is_virtual,
        active: true,
      });
      if (error) console.error(`× ${r.name}: ${error.message}`);
      else console.log(`✓ sala criada: ${r.name} em ${org.name}`);
    }
  }
}

async function main() {
  console.log('--- profissionais (backfill) ---');
  await backfillProfessionals();
  console.log('\n--- salas padrão ---');
  await seedRooms();
  console.log('\nseed completo.');
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
