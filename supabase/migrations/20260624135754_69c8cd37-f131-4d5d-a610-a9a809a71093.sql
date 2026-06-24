
-- 1) Lock down SECURITY DEFINER functions: revoke broad EXECUTE, set search_path

-- has_role: only authenticated needs EXECUTE (RLS policies); revoke from public/anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Trigger functions: never called directly via API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Email queue helpers: server-only via service_role (supabaseAdmin); revoke from public/anon/authenticated
-- Also fix mutable search_path
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;

-- 2) Patrol shifts: split the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Volunteers reserve or update assigned shifts" ON public.patrol_shifts;

-- Assigned volunteers can update their shifts (e.g. notes, cancel)
CREATE POLICY "Assigned volunteers update their shifts"
  ON public.patrol_shifts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = volunteer_1 OR auth.uid() = volunteer_2)
  WITH CHECK (auth.uid() = volunteer_1 OR auth.uid() = volunteer_2);

-- Any authenticated user can reserve an open shift, but the post-update row
-- must reserve it to themselves and transition to 'reserved'. A trigger
-- below blocks tampering with unrelated columns.
CREATE POLICY "Volunteers reserve open shifts"
  ON public.patrol_shifts
  FOR UPDATE
  TO authenticated
  USING (status = 'open')
  WITH CHECK (
    auth.uid() = reserved_by
    AND status = 'reserved'
  );

-- Column-tamper guard: when a non-officer is reserving an open shift,
-- only reserved_by, status, and updated_at may change.
CREATE OR REPLACE FUNCTION public.patrol_shifts_reserve_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin')
     OR public.has_role(auth.uid(), 'officer')
     OR public.has_role(auth.uid(), 'corporal_plus')
     OR auth.uid() = OLD.volunteer_1
     OR auth.uid() = OLD.volunteer_2
  THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'open' AND NEW.status = 'reserved' AND NEW.reserved_by = auth.uid() THEN
    IF NEW.unit_id          IS DISTINCT FROM OLD.unit_id
       OR NEW.shift_date     IS DISTINCT FROM OLD.shift_date
       OR NEW.start_time     IS DISTINCT FROM OLD.start_time
       OR NEW.end_time       IS DISTINCT FROM OLD.end_time
       OR NEW.patrol_area    IS DISTINCT FROM OLD.patrol_area
       OR NEW.notes          IS DISTINCT FROM OLD.notes
       OR NEW.volunteer_1    IS DISTINCT FROM OLD.volunteer_1
       OR NEW.volunteer_2    IS DISTINCT FROM OLD.volunteer_2
       OR NEW.vehicle_id     IS DISTINCT FROM OLD.vehicle_id
    THEN
      RAISE EXCEPTION 'You can only reserve an open shift; other fields cannot be changed.';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'You are not permitted to update this shift.';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.patrol_shifts_reserve_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS patrol_shifts_reserve_guard_trg ON public.patrol_shifts;
CREATE TRIGGER patrol_shifts_reserve_guard_trg
  BEFORE UPDATE ON public.patrol_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.patrol_shifts_reserve_guard();

-- 3) Replace permissive WITH CHECK (true) on public submission forms with
-- real validation so the policy is no longer "always true".
DROP POLICY IF EXISTS "Anyone can submit demo request" ON public.demo_requests;
CREATE POLICY "Anyone can submit demo request"
  ON public.demo_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 200
    AND char_length(work_email) BETWEEN 3 AND 320
    AND work_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (message IS NULL OR char_length(message) <= 5000)
  );

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(message) BETWEEN 1 AND 5000
  );
