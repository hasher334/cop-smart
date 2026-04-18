DO $$
DECLARE
  old_id uuid;
BEGIN
  FOR old_id IN
    SELECT id FROM auth.users
    WHERE email IN ('badge1234@pbso-volunteers.com', 'badge1234@copsmart-volunteers.com')
  LOOP
    DELETE FROM public.user_roles WHERE user_id = old_id;
    DELETE FROM public.profiles WHERE user_id = old_id;
    DELETE FROM auth.identities WHERE user_id = old_id;
    DELETE FROM auth.users WHERE id = old_id;
  END LOOP;
END $$;

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  hashed_pw text := crypt('admin1234', gen_salt('bf'));
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'badge1234@copsmart-volunteers.com',
    hashed_pw,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"badge_no":"1234","full_name":"Admin User"}'::jsonb,
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'badge1234@copsmart-volunteers.com'),
    'email',
    new_user_id::text,
    now(), now(), now()
  );

  INSERT INTO public.profiles (user_id, badge_no, full_name, email, status)
  VALUES (new_user_id, '1234', 'Admin User', 'badge1234@copsmart-volunteers.com', 'active')
  ON CONFLICT (user_id) DO UPDATE SET status = 'active', full_name = 'Admin User', badge_no = '1234';

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;