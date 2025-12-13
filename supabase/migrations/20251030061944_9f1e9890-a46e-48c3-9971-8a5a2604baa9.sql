-- Make user_id nullable in article_likes table to support anonymous likes
ALTER TABLE public.article_likes 
ALTER COLUMN user_id DROP NOT NULL;