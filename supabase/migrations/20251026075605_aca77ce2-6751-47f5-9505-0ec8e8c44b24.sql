-- Create article_content table
CREATE TABLE public.article_content (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  article_type TEXT NOT NULL CHECK (article_type IN ('Design Notes', 'Ryon Lore', 'Worldbuilding Tips')),
  published_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_time INTEGER NOT NULL,
  tldr TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create article_likes table to track user likes
CREATE TABLE public.article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id BIGINT NOT NULL REFERENCES public.article_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.article_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for article_content
CREATE POLICY "Anyone can view published articles"
  ON public.article_content
  FOR SELECT
  USING (true);

CREATE POLICY "Editors can insert articles"
  ON public.article_content
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can update articles"
  ON public.article_content
  FOR UPDATE
  USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can delete articles"
  ON public.article_content
  FOR DELETE
  USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for article_likes
CREATE POLICY "Anyone can view likes"
  ON public.article_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their own likes"
  ON public.article_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.article_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on article_content
CREATE TRIGGER update_article_content_updated_at
  BEFORE UPDATE ON public.article_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update like_count when article_likes changes
CREATE OR REPLACE FUNCTION public.update_article_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.article_content
    SET like_count = like_count + 1
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.article_content
    SET like_count = like_count - 1
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to automatically update like_count
CREATE TRIGGER update_article_likes_count
  AFTER INSERT OR DELETE ON public.article_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_article_like_count();

-- Function to increment view count (called from frontend)
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.article_content
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$;