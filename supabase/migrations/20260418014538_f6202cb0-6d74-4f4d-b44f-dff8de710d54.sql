
-- Documents catalog table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents viewable by authenticated"
  ON public.documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Officers manage documents"
  ON public.documents FOR ALL TO authenticated
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

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Storage RLS: any authenticated user can read; officers+ can manage
CREATE POLICY "Authenticated read documents bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Officers upload documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'officer') OR
      public.has_role(auth.uid(), 'corporal_plus')
    )
  );

CREATE POLICY "Officers update documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents' AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'officer') OR
      public.has_role(auth.uid(), 'corporal_plus')
    )
  );

CREATE POLICY "Officers delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents' AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'officer') OR
      public.has_role(auth.uid(), 'corporal_plus')
    )
  );
