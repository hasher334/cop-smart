
-- 1. has_role -> SECURITY INVOKER (users can read their own user_roles row via RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. email_send_state: restrict policy to service_role only
DROP POLICY IF EXISTS "Service role can manage send state" ON public.email_send_state;
CREATE POLICY "Service role can manage send state"
ON public.email_send_state
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. patrol_shifts: tighten volunteer reservation policy
DROP POLICY IF EXISTS "Volunteers reserve open shifts" ON public.patrol_shifts;
CREATE POLICY "Volunteers reserve open shifts"
ON public.patrol_shifts
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  status = 'open'::patrol_status
  AND reserved_by IS NULL
)
WITH CHECK (
  status = 'reserved'::patrol_status
  AND reserved_by = auth.uid()
);
