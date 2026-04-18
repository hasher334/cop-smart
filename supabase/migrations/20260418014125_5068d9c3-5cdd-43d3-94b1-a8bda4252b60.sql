
ALTER TABLE public.patrol_shifts
  ADD COLUMN vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL;

CREATE INDEX idx_patrol_shifts_vehicle_id ON public.patrol_shifts(vehicle_id);
