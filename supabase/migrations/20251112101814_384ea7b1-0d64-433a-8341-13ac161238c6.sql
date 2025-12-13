-- Drop original_path columns since we no longer store original files
ALTER TABLE public.images DROP COLUMN IF EXISTS original_path;
ALTER TABLE public.gallery_image_files DROP COLUMN IF EXISTS original_path;

-- Add storage lifecycle policy for automatic cleanup of archived images after 7 days
-- This policy automatically deletes files from storage when their metadata has been archived for 7+ days

-- Function to clean up archived image files older than 7 days
CREATE OR REPLACE FUNCTION public.cleanup_archived_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  image_record RECORD;
  paths_to_delete TEXT[];
BEGIN
  -- Clean up archived images from images table
  FOR image_record IN 
    SELECT id, thumbnail_path, medium_path, large_path, webp_path, created_at
    FROM public.images
    WHERE archived = true 
    AND created_at < NOW() - INTERVAL '7 days'
  LOOP
    -- Collect all paths to delete
    paths_to_delete := ARRAY[
      image_record.thumbnail_path,
      image_record.medium_path,
      image_record.large_path,
      image_record.webp_path
    ];
    
    -- Delete files from storage (content-images bucket)
    -- Note: This uses the storage.delete RPC which requires service role
    PERFORM storage.delete_object('content-images', unnest(paths_to_delete));
    
    -- Delete database record
    DELETE FROM public.images WHERE id = image_record.id;
  END LOOP;

  -- Clean up archived gallery image files from gallery_image_files table
  FOR image_record IN 
    SELECT id, thumbnail_path, medium_path, large_path, webp_path, created_at
    FROM public.gallery_image_files
    WHERE archived = true 
    AND created_at < NOW() - INTERVAL '7 days'
  LOOP
    -- Collect all paths to delete
    paths_to_delete := ARRAY[
      image_record.thumbnail_path,
      image_record.medium_path,
      image_record.large_path,
      image_record.webp_path
    ];
    
    -- Delete files from storage (gallery-images bucket)
    PERFORM storage.delete_object('gallery-images', unnest(paths_to_delete));
    
    -- Delete database record
    DELETE FROM public.gallery_image_files WHERE id = image_record.id;
  END LOOP;
END;
$$;

-- Schedule cleanup to run daily via pg_cron (if available) or manual trigger
-- Note: Since pg_cron might not be available, this is commented out
-- Admins should run this manually or set up via Supabase dashboard
-- SELECT cron.schedule('cleanup-archived-images', '0 2 * * *', 'SELECT public.cleanup_archived_images()');

COMMENT ON FUNCTION public.cleanup_archived_images() IS 
'Deletes archived image files (both metadata and storage files) that are older than 7 days. Should be run daily via scheduled task or manually.';
