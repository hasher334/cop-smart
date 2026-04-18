-- Vehicle status enum
CREATE TYPE public.vehicle_status AS ENUM (
  'in_service',
  'out_of_service',
  'maintenance',
  'retired'
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_no TEXT NOT NULL UNIQUE,
  make TEXT,
  model TEXT,
  year INTEGER,
  license_plate TEXT,
  vin TEXT,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  status public.vehicle_status NOT NULL DEFAULT 'in_service',
  mileage INTEGER,
  last_service_date DATE,
  next_service_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicles viewable by authenticated"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Officers manage vehicles"
  ON public.vehicles FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'officer'::app_role)
    OR has_role(auth.uid(), 'corporal_plus'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'officer'::app_role)
    OR has_role(auth.uid(), 'corporal_plus'::app_role)
  );

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_vehicles_unit_id ON public.vehicles(unit_id);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);