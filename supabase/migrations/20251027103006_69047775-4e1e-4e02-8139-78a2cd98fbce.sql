-- Create gallery-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- Storage policies for gallery-images bucket
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Editors can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-images' 
  AND (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Editors can update gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-images' 
  AND (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Editors can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-images' 
  AND (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'))
);

-- Gallery image files metadata table (similar to images table)
CREATE TABLE public.gallery_image_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_path TEXT NOT NULL,
  thumbnail_path TEXT,
  medium_path TEXT,
  large_path TEXT,
  webp_path TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  archived BOOLEAN DEFAULT false,
  replaced_by UUID REFERENCES public.gallery_image_files(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Gallery images table (main content table)
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (
    image_type IN (
      'Realm Landscapes',
      'Cartography & Battle Maps',
      'Heroes & Allies',
      'Monsters & Adversaries',
      'Relics & Items',
      'Concept Art'
    )
  ),
  orientation TEXT NOT NULL CHECK (orientation IN ('landscape', 'portrait', 'square')),
  published_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  image_description TEXT CHECK (char_length(image_description) <= 1000),
  image_creation_tool TEXT,
  prompt_used TEXT CHECK (char_length(prompt_used) <= 2000),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  image_file_id UUID REFERENCES public.gallery_image_files(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on gallery tables
ALTER TABLE public.gallery_image_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_image_files
CREATE POLICY "Anyone can view non-archived gallery image files"
ON public.gallery_image_files FOR SELECT
USING (archived = false);

CREATE POLICY "Editors can insert gallery image files"
ON public.gallery_image_files FOR INSERT
WITH CHECK (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can update gallery image files"
ON public.gallery_image_files FOR UPDATE
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- RLS policies for gallery_images
CREATE POLICY "Anyone can view published gallery images"
ON public.gallery_images FOR SELECT
USING (true);

CREATE POLICY "Editors can insert gallery images"
ON public.gallery_images FOR INSERT
WITH CHECK (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can update gallery images"
ON public.gallery_images FOR UPDATE
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can delete gallery images"
ON public.gallery_images FOR DELETE
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- Function to increment gallery image views
CREATE OR REPLACE FUNCTION public.increment_gallery_views(gallery_image_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.gallery_images
  SET view_count = view_count + 1
  WHERE id = gallery_image_id;
END;
$$;

-- Trigger for gallery_images updated_at
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_gallery_images_type ON public.gallery_images(image_type);
CREATE INDEX idx_gallery_images_orientation ON public.gallery_images(orientation);
CREATE INDEX idx_gallery_images_published_date ON public.gallery_images(published_date DESC);
CREATE INDEX idx_gallery_images_tags ON public.gallery_images USING GIN(tags);
CREATE INDEX idx_gallery_image_files_archived ON public.gallery_image_files(archived) WHERE archived = false;