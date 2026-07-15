
CREATE OR REPLACE FUNCTION public.user_district(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT district_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;
