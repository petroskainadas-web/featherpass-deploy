ALTER TABLE public.library_content 
DROP CONSTRAINT library_content_content_type_check;

ALTER TABLE public.library_content 
ADD CONSTRAINT library_content_content_type_check 
CHECK (content_type = ANY (ARRAY['monster', 'subclass', 'spell', 'magic_item', 'subrace', 'npc', 'feat']));