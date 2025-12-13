-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create images table for metadata
CREATE TABLE public.images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_path TEXT NOT NULL,
  thumbnail_path TEXT,
  medium_path TEXT,
  large_path TEXT,
  webp_path TEXT,
  alt_text TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  archived BOOLEAN DEFAULT false,
  replaced_by UUID REFERENCES public.images(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add image_id to library_content
ALTER TABLE public.library_content
ADD COLUMN image_id UUID REFERENCES public.images(id);

-- Enable RLS on images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- RLS policies for images
CREATE POLICY "Anyone can view non-archived images"
ON public.images
FOR SELECT
USING (archived = false);

CREATE POLICY "Editors can insert images"
ON public.images
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can update their images"
ON public.images
FOR UPDATE
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- Storage policies for content-images bucket
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'content-images');

CREATE POLICY "Editors can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'content-images' AND
  (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Editors can update images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'content-images' AND
  (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Editors can delete images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'content-images' AND
  (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

-- Create index for better performance
CREATE INDEX idx_images_created_by ON public.images(created_by);
CREATE INDEX idx_images_archived ON public.images(archived);
CREATE INDEX idx_library_content_image_id ON public.library_content(image_id);