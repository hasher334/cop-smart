-- Migrate emails to the new domain in auth.users
UPDATE auth.users
SET email = REPLACE(email, '@pbso-volunteers.com', '@copsmart-volunteers.com'),
    encrypted_password = crypt('demo1234', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email LIKE '%@pbso-volunteers.com';

-- Update identities to match
UPDATE auth.identities
SET identity_data = jsonb_set(
      identity_data,
      '{email}',
      to_jsonb(REPLACE(identity_data->>'email', '@pbso-volunteers.com', '@copsmart-volunteers.com'))
    ),
    updated_at = now()
WHERE identity_data->>'email' LIKE '%@pbso-volunteers.com';

-- Sync the profile email column
UPDATE public.profiles
SET email = REPLACE(email, '@pbso-volunteers.com', '@copsmart-volunteers.com')
WHERE email LIKE '%@pbso-volunteers.com';