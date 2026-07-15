UPDATE public.patrol_shifts ps SET assigned_to = NULL
WHERE assigned_to IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = ps.assigned_to);

ALTER TABLE public.patrol_shifts DROP CONSTRAINT patrol_shifts_assigned_to_fkey;
ALTER TABLE public.patrol_shifts
  ADD CONSTRAINT patrol_shifts_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;