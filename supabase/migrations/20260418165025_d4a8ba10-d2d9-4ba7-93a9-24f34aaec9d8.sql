CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  source text DEFAULT 'volcop_site',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));