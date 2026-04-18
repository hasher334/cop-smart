-- Enums
CREATE TYPE public.patrol_status AS ENUM ('open', 'reserved', 'on_duty', 'completed', 'cancelled');
CREATE TYPE public.patrol_type AS ENUM ('patrol', 'special_event', 'training', 'meeting', 'other');

-- Patrol shifts table
CREATE TABLE public.patrol_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE RESTRICT,
  patrol_type public.patrol_type NOT NULL DEFAULT 'patrol',
  patrol_area TEXT,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status public.patrol_status NOT NULL DEFAULT 'open',
  volunteer_1 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  volunteer_2 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reserved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reserved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patrol_shifts_date_unit ON public.patrol_shifts(shift_date, unit_id);
CREATE INDEX idx_patrol_shifts_volunteer_1 ON public.patrol_shifts(volunteer_1);
CREATE INDEX idx_patrol_shifts_volunteer_2 ON public.patrol_shifts(volunteer_2);

ALTER TABLE public.patrol_shifts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view
CREATE POLICY "Patrol shifts viewable by authenticated"
  ON public.patrol_shifts FOR SELECT
  TO authenticated
  USING (true);

-- Officers/admins can insert
CREATE POLICY "Officers create shifts"
  ON public.patrol_shifts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'officer') OR
    public.has_role(auth.uid(), 'corporal_plus')
  );

-- Officers/admins can update anything; volunteers can update if they are assigned or reserving an open shift
CREATE POLICY "Officers update shifts"
  ON public.patrol_shifts FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'officer') OR
    public.has_role(auth.uid(), 'corporal_plus')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'officer') OR
    public.has_role(auth.uid(), 'corporal_plus')
  );

CREATE POLICY "Volunteers reserve or update assigned shifts"
  ON public.patrol_shifts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = volunteer_1 OR
    auth.uid() = volunteer_2 OR
    status = 'open'
  )
  WITH CHECK (
    auth.uid() = volunteer_1 OR
    auth.uid() = volunteer_2 OR
    auth.uid() = reserved_by
  );

-- Only officers/admins can delete
CREATE POLICY "Officers delete shifts"
  ON public.patrol_shifts FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'officer') OR
    public.has_role(auth.uid(), 'corporal_plus')
  );

-- updated_at trigger
CREATE TRIGGER trg_patrol_shifts_updated_at
  BEFORE UPDATE ON public.patrol_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();