
-- 1) Revoke EXECUTE from anon/authenticated on SECURITY DEFINER helpers that
--    should only be invoked by cron/service_role.
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake()     FROM anon, authenticated, PUBLIC;

-- 2) Tighten patrol_shifts_reserve_guard: assigned volunteers may only touch
--    status / notes / reservation fields on their own shift.
CREATE OR REPLACE FUNCTION public.patrol_shifts_reserve_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Elevated roles: unrestricted.
  IF public.has_role(auth.uid(), 'admin')
     OR public.has_role(auth.uid(), 'officer')
     OR public.has_role(auth.uid(), 'corporal_plus')
  THEN
    RETURN NEW;
  END IF;

  -- Volunteer reserving an open shift for themselves.
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
       OR NEW.assigned_by IS DISTINCT FROM OLD.assigned_by
       OR NEW.assigned_at IS DISTINCT FROM OLD.assigned_at
    THEN
      RAISE EXCEPTION 'You can only reserve an open shift; other fields cannot be changed.';
    END IF;
    RETURN NEW;
  END IF;

  -- Already-assigned volunteer editing their own shift: allow ONLY status/
  -- notes / reservation-release fields; every other column must be unchanged.
  IF auth.uid() = OLD.volunteer_1 OR auth.uid() = OLD.volunteer_2 THEN
    IF NEW.unit_id       IS DISTINCT FROM OLD.unit_id
       OR NEW.patrol_type IS DISTINCT FROM OLD.patrol_type
       OR NEW.shift_date  IS DISTINCT FROM OLD.shift_date
       OR NEW.start_time  IS DISTINCT FROM OLD.start_time
       OR NEW.end_time    IS DISTINCT FROM OLD.end_time
       OR NEW.patrol_area IS DISTINCT FROM OLD.patrol_area
       OR NEW.volunteer_1 IS DISTINCT FROM OLD.volunteer_1
       OR NEW.volunteer_2 IS DISTINCT FROM OLD.volunteer_2
       OR NEW.vehicle_id  IS DISTINCT FROM OLD.vehicle_id
       OR NEW.created_by  IS DISTINCT FROM OLD.created_by
       OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       OR NEW.assigned_by IS DISTINCT FROM OLD.assigned_by
       OR NEW.assigned_at IS DISTINCT FROM OLD.assigned_at
    THEN
      RAISE EXCEPTION 'Assigned volunteers may only update status, notes, or release their reservation.';
    END IF;
    -- Status transitions permitted for the assigned volunteer.
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NEW.status NOT IN ('reserved', 'completed', 'no_show', 'open')
    THEN
      RAISE EXCEPTION 'Assigned volunteers cannot set this status.';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'You are not permitted to update this shift.';
END;
$function$;

-- 3) Extend profiles_district_guard to also block self-escalation of
--    privileged columns (status / badge_no / rank / home_unit_id). Admins
--    keep full edit rights via the "Admins update any profile" policy.
CREATE OR REPLACE FUNCTION public.profiles_district_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Admin edits: unrestricted.
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admin: cannot change district.
  IF NEW.district_id IS DISTINCT FROM OLD.district_id THEN
    RAISE EXCEPTION 'Only admins can change a member''s district.';
  END IF;

  -- Non-admin editing their OWN profile: cannot self-promote via privileged
  -- columns. Restrict everything but contact / display fields.
  IF auth.uid() = OLD.user_id THEN
    IF NEW.status       IS DISTINCT FROM OLD.status
       OR NEW.badge_no    IS DISTINCT FROM OLD.badge_no
       OR NEW.rank        IS DISTINCT FROM OLD.rank
       OR NEW.home_unit_id IS DISTINCT FROM OLD.home_unit_id
       OR NEW.user_id     IS DISTINCT FROM OLD.user_id
       OR NEW.hire_date   IS DISTINCT FROM OLD.hire_date
    THEN
      RAISE EXCEPTION 'Only admins can change your status, badge, rank, hire date, or home unit.';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;
