-- Catalog of training courses / certifications
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  validity_months INTEGER,
  required BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses viewable by authenticated"
  ON public.training_courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Officers manage courses"
  ON public.training_courses FOR ALL TO authenticated
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

CREATE TRIGGER update_training_courses_updated_at
  BEFORE UPDATE ON public.training_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-volunteer completion records
CREATE TABLE public.training_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  expiration_date DATE,
  certificate_no TEXT,
  instructor TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own training records"
  ON public.training_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Officers view all training records"
  ON public.training_records FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'officer'::app_role)
    OR has_role(auth.uid(), 'corporal_plus'::app_role)
  );

CREATE POLICY "Officers manage training records"
  ON public.training_records FOR ALL TO authenticated
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

CREATE TRIGGER update_training_records_updated_at
  BEFORE UPDATE ON public.training_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_training_records_user_id ON public.training_records(user_id);
CREATE INDEX idx_training_records_course_id ON public.training_records(course_id);
CREATE INDEX idx_training_records_expiration ON public.training_records(expiration_date);