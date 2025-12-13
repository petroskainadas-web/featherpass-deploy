-- Update RLS policies to allow admins/editors to view archived records

-- Drop existing policies for images table
DROP POLICY IF EXISTS "Anyone can view non-archived images" ON public.images;

-- Create new policies for images table
CREATE POLICY "Public can view non-archived images"
  ON public.images
  FOR SELECT
  USING (archived = false);

CREATE POLICY "Editors can view all images including archived"
  ON public.images
  FOR SELECT
  USING (
    has_role(auth.uid(), 'editor') OR 
    has_role(auth.uid(), 'admin')
  );

-- Drop existing policies for gallery_image_files table
DROP POLICY IF EXISTS "Anyone can view non-archived gallery image files" ON public.gallery_image_files;

-- Create new policies for gallery_image_files table
CREATE POLICY "Public can view non-archived gallery image files"
  ON public.gallery_image_files
  FOR SELECT
  USING (archived = false);

CREATE POLICY "Editors can view all gallery image files including archived"
  ON public.gallery_image_files
  FOR SELECT
  USING (
    has_role(auth.uid(), 'editor') OR 
    has_role(auth.uid(), 'admin')
  );

-- Drop existing policies for content_pdfs table
DROP POLICY IF EXISTS "Anyone can view non-archived PDFs metadata" ON public.content_pdfs;

-- Create new policies for content_pdfs table
CREATE POLICY "Public can view non-archived PDFs metadata"
  ON public.content_pdfs
  FOR SELECT
  USING (archived = false);

CREATE POLICY "Editors can view all PDFs metadata including archived"
  ON public.content_pdfs
  FOR SELECT
  USING (
    has_role(auth.uid(), 'editor') OR 
    has_role(auth.uid(), 'admin')
  );