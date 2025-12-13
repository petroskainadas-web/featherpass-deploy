-- 1. **DROP** the function first to allow for a change in signature (if one occurred).
-- The signature (name + argument types) is required to drop the correct function.
DROP FUNCTION IF EXISTS public.increment_library_download_count(content_id uuid) CASCADE;

-- 2. **CREATE OR REPLACE** the function with the desired definition
-- Function to atomically increment download counts for library content
CREATE OR REPLACE FUNCTION public.increment_library_download_count(content_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE library_content
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = content_id
  RETURNING download_count;
$$;

-- 3. **GRANT** permissions
GRANT EXECUTE ON FUNCTION public.increment_library_download_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_library_download_count(uuid) TO anon;