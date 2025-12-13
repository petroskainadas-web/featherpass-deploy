-- Add indexes for library_content table to optimize queries
CREATE INDEX IF NOT EXISTS idx_library_content_created_at ON public.library_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_library_content_content_type ON public.library_content(content_type);
CREATE INDEX IF NOT EXISTS idx_library_content_tags ON public.library_content USING GIN(tags);

-- Add indexes for article_content table to optimize queries
CREATE INDEX IF NOT EXISTS idx_article_content_published_date ON public.article_content(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_article_content_article_type ON public.article_content(article_type);

-- Add composite index for article_likes table to optimize lookups
CREATE INDEX IF NOT EXISTS idx_article_likes_article_user ON public.article_likes(article_id, user_id);

-- Add indexes for gallery_images table to optimize queries
CREATE INDEX IF NOT EXISTS idx_gallery_images_published_date ON public.gallery_images(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_orientation ON public.gallery_images(orientation);
CREATE INDEX IF NOT EXISTS idx_gallery_images_image_type ON public.gallery_images(image_type);