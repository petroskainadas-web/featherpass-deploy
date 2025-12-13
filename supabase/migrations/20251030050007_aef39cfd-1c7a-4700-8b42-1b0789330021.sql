-- Phase 1: Create missing database function for library downloads
CREATE OR REPLACE FUNCTION public.increment_library_download_count(content_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.library_content
  SET download_count = download_count + 1
  WHERE id = content_id;
END;
$$;

-- Phase 2: Update RLS policies to allow anonymous article likes
DROP POLICY IF EXISTS "Authenticated users can insert their own likes" ON public.article_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.article_likes;

-- Allow anyone (including anonymous) to insert likes
CREATE POLICY "Anyone can insert likes"
ON public.article_likes
FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete likes (client will track via localStorage)
CREATE POLICY "Anyone can delete likes"
ON public.article_likes
FOR DELETE
USING (true);