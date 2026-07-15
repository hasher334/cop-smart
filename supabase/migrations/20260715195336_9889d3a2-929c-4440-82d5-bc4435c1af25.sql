
-- Allow anon read of districts (safe: only id/code/name/etc — no PII)
GRANT SELECT ON public.districts TO anon;
CREATE POLICY "Public can read districts"
  ON public.districts FOR SELECT
  TO anon
  USING (true);

-- Sequence for auto-assigned badge numbers
CREATE SEQUENCE IF NOT EXISTS public.badge_no_seq START WITH 10000 INCREMENT BY 1;
GRANT USAGE ON SEQUENCE public.badge_no_seq TO service_role;

-- Update handle_new_user to auto-generate a badge number if not provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _district uuid;
  _badge text;
BEGIN
  BEGIN
    _district := NULLIF(NEW.raw_user_meta_data->>'district_id','')::uuid;
  EXCEPTION WHEN others THEN
    _district := NULL;
  END;

  _badge := NULLIF(NEW.raw_user_meta_data->>'badge_no','');
  IF _badge IS NULL THEN
    _badge := nextval('public.badge_no_seq')::text;
  END IF;

  INSERT INTO public.profiles (user_id, badge_no, full_name, email, status, district_id)
  VALUES (
    NEW.id,
    _badge,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Volunteer'),
    NEW.email,
    'pending',
    _district
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'volunteer');
  RETURN NEW;
END;
$function$;

-- Advance sequence past any existing numeric badges to avoid collisions
SELECT setval(
  'public.badge_no_seq',
  GREATEST(
    10000,
    COALESCE((SELECT MAX(badge_no::bigint) FROM public.profiles WHERE badge_no ~ '^[0-9]+$'), 10000)
  )
);
