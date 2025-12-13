-- Step 1: Drop the old CHECK constraint first
ALTER TABLE public.article_content 
DROP CONSTRAINT IF EXISTS article_content_article_type_check;

-- Step 2: Update existing article records
UPDATE public.article_content 
SET article_type = 'Plot Crafting' 
WHERE article_type = 'Ryon Lore';

-- Step 3: Add new CHECK constraint with updated literal
ALTER TABLE public.article_content 
ADD CONSTRAINT article_content_article_type_check 
CHECK (article_type IN ('Design Notes', 'Plot Crafting', 'Worldbuilding Tips'));