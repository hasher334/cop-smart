
-- 1. districts table
CREATE TABLE public.districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.districts TO authenticated;
GRANT ALL ON public.districts TO service_role;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read districts" ON public.districts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage districts insert" ON public.districts
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage districts update" ON public.districts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage districts delete" ON public.districts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON public.districts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. add district_id to profiles and units
ALTER TABLE public.profiles ADD COLUMN district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL;
ALTER TABLE public.units    ADD COLUMN district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL;

-- 3. assignment fields on patrol_shifts
ALTER TABLE public.patrol_shifts
  ADD COLUMN assigned_to  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN assigned_by  uuid REFERENCES auth.users(id)      ON DELETE SET NULL,
  ADD COLUMN assigned_at  timestamptz;

-- 4. helper: caller's district
CREATE OR REPLACE FUNCTION public.user_district(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT district_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.user_district(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_district(uuid) TO authenticated, service_role;

-- 5. handle_new_user: capture district_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _district uuid;
BEGIN
  BEGIN
    _district := NULLIF(NEW.raw_user_meta_data->>'district_id','')::uuid;
  EXCEPTION WHEN others THEN
    _district := NULL;
  END;

  INSERT INTO public.profiles (user_id, badge_no, full_name, email, status, district_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'badge_no', 'TEMP-' || substr(NEW.id::text,1,8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Volunteer'),
    NEW.email,
    'pending',
    _district
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'volunteer');
  RETURN NEW;
END;
$$;

-- 6. block non-admin district_id changes on profiles
CREATE OR REPLACE FUNCTION public.profiles_district_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.district_id IS DISTINCT FROM OLD.district_id
     AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Only admins can change a member''s district.';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_district_guard ON public.profiles;
CREATE TRIGGER profiles_district_guard
  BEFORE UPDATE OF district_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_district_guard();

-- 7. patrol_shifts RLS: allow officers/corporal_plus scoped to their district
--    Drop existing insert/update policies we're replacing (leave volunteer reserve policy intact).
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='patrol_shifts'
             AND policyname IN (
               'Admins manage shifts',
               'Admins manage shifts insert',
               'Admins manage shifts update',
               'Admins manage shifts delete',
               'Officers manage shifts',
               'Officers can insert shifts',
               'Officers can update shifts'
             )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.patrol_shifts', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins full access shifts" ON public.patrol_shifts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Officers insert shifts in district" ON public.patrol_shifts
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(),'officer') OR public.has_role(auth.uid(),'corporal_plus'))
    AND EXISTS (
      SELECT 1 FROM public.units u
      WHERE u.id = patrol_shifts.unit_id
        AND u.district_id IS NOT NULL
        AND u.district_id = public.user_district(auth.uid())
    )
    AND (
      patrol_shifts.assigned_to IS NULL
      OR EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = patrol_shifts.assigned_to
          AND pr.district_id = public.user_district(auth.uid())
      )
    )
  );

CREATE POLICY "Officers update shifts in district" ON public.patrol_shifts
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(),'officer') OR public.has_role(auth.uid(),'corporal_plus'))
    AND EXISTS (
      SELECT 1 FROM public.units u
      WHERE u.id = patrol_shifts.unit_id
        AND u.district_id = public.user_district(auth.uid())
    )
  )
  WITH CHECK (
    (public.has_role(auth.uid(),'officer') OR public.has_role(auth.uid(),'corporal_plus'))
    AND EXISTS (
      SELECT 1 FROM public.units u
      WHERE u.id = patrol_shifts.unit_id
        AND u.district_id = public.user_district(auth.uid())
    )
    AND (
      patrol_shifts.assigned_to IS NULL
      OR EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = patrol_shifts.assigned_to
          AND pr.district_id = public.user_district(auth.uid())
      )
    )
  );

CREATE POLICY "Officers delete shifts in district" ON public.patrol_shifts
  FOR DELETE TO authenticated
  USING (
    (public.has_role(auth.uid(),'officer') OR public.has_role(auth.uid(),'corporal_plus'))
    AND EXISTS (
      SELECT 1 FROM public.units u
      WHERE u.id = patrol_shifts.unit_id
        AND u.district_id = public.user_district(auth.uid())
    )
  );

-- 8. extend reserve guard so officers/corporal_plus in-district may edit freely,
--    and record assigned_by/assigned_at automatically.
CREATE OR REPLACE FUNCTION public.patrol_shifts_reserve_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Auto stamp assignment metadata
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    IF NEW.assigned_to IS NULL THEN
      NEW.assigned_by := NULL;
      NEW.assigned_at := NULL;
    ELSE
      NEW.assigned_by := auth.uid();
      NEW.assigned_at := now();
    END IF;
  END IF;

  IF public.has_role(auth.uid(),'admin')
     OR public.has_role(auth.uid(),'officer')
     OR public.has_role(auth.uid(),'corporal_plus')
     OR auth.uid() = OLD.volunteer_1
     OR auth.uid() = OLD.volunteer_2
  THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'open' AND NEW.status = 'reserved' AND NEW.reserved_by = auth.uid() THEN
    IF NEW.unit_id       IS DISTINCT FROM OLD.unit_id
       OR NEW.shift_date  IS DISTINCT FROM OLD.shift_date
       OR NEW.start_time  IS DISTINCT FROM OLD.start_time
       OR NEW.end_time    IS DISTINCT FROM OLD.end_time
       OR NEW.patrol_area IS DISTINCT FROM OLD.patrol_area
       OR NEW.notes       IS DISTINCT FROM OLD.notes
       OR NEW.volunteer_1 IS DISTINCT FROM OLD.volunteer_1
       OR NEW.volunteer_2 IS DISTINCT FROM OLD.volunteer_2
       OR NEW.vehicle_id  IS DISTINCT FROM OLD.vehicle_id
       OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
    THEN
      RAISE EXCEPTION 'You can only reserve an open shift; other fields cannot be changed.';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'You are not permitted to update this shift.';
END;
$$;
