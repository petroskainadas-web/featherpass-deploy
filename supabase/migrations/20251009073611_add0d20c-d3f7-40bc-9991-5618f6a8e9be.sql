-- Create storage bucket for content PDFs (private bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-pdfs', 'content-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Create content_pdfs table to store PDF metadata
CREATE TABLE IF NOT EXISTS public.content_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  description TEXT,
  archived BOOLEAN DEFAULT false NOT NULL,
  replaced_by UUID REFERENCES public.content_pdfs(id)
);

-- Enable RLS on content_pdfs table
ALTER TABLE public.content_pdfs ENABLE ROW LEVEL SECURITY;

-- Add pdf_id column to library_content table
ALTER TABLE public.library_content 
ADD COLUMN IF NOT EXISTS pdf_id UUID REFERENCES public.content_pdfs(id);

-- RLS Policies for content_pdfs table
CREATE POLICY "Anyone can view non-archived PDFs metadata"
ON public.content_pdfs
FOR SELECT
USING (archived = false);

CREATE POLICY "Editors can insert PDF metadata"
ON public.content_pdfs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can update PDF metadata"
ON public.content_pdfs
FOR UPDATE
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for storage.objects (content-pdfs bucket)
CREATE POLICY "Editors can upload PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'content-pdfs' 
  AND (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Editors can update PDFs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'content-pdfs' 
  AND (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Authenticated users can download PDFs via signed URLs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'content-pdfs');