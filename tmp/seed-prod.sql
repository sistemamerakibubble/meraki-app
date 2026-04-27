-- Seed inicial em produção: org dev + admin + supervisor

insert into public.orgs (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Clínica Meraki', 'meraki')
on conflict (id) do nothing;

-- Admin
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000000a1',
  'authenticated', 'authenticated',
  'admin@meraki.app',
  crypt('MerakiAdmin2026!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  '', '', '', '', '', ''
) on conflict (id) do update set encrypted_password = excluded.encrypted_password;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a1',
  jsonb_build_object('sub','00000000-0000-0000-0000-0000000000a1','email','admin@meraki.app','email_verified',true),
  'email',
  now(), now(), now()
) on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, org_id, full_name, role, active)
values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'Administrador',
  'admin',
  true
) on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, org_id = excluded.org_id;

-- Supervisor
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000000a3',
  'authenticated', 'authenticated',
  'supervisor@meraki.app',
  crypt('MerakiSupervisor2026!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  '', '', '', '', '', ''
) on conflict (id) do update set encrypted_password = excluded.encrypted_password;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-0000000000a3',
  '00000000-0000-0000-0000-0000000000a3',
  jsonb_build_object('sub','00000000-0000-0000-0000-0000000000a3','email','supervisor@meraki.app','email_verified',true),
  'email',
  now(), now(), now()
) on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, org_id, full_name, role, active)
values (
  '00000000-0000-0000-0000-0000000000a3',
  '00000000-0000-0000-0000-000000000001',
  'Dra. Supervisora',
  'supervisor',
  true
) on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, org_id = excluded.org_id;

select u.email, p.full_name, p.role from auth.users u join public.profiles p on p.id = u.id order by u.email;
