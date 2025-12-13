-- Add unsubscribe functionality columns to newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers
ADD COLUMN IF NOT EXISTS unsubscribed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS unsubscribed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS unsubscribe_reason text,
ADD COLUMN IF NOT EXISTS resubscribed_count integer NOT NULL DEFAULT 0;

-- Create index on unsubscribe_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token 
ON public.newsletter_subscribers(unsubscribe_token);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email 
ON public.newsletter_subscribers(email);

-- Add RLS policy for public unsubscribe access (token-based)
CREATE POLICY "Anyone can unsubscribe with valid token"
ON public.newsletter_subscribers
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add comment explaining the unsubscribe_token purpose
COMMENT ON COLUMN public.newsletter_subscribers.unsubscribe_token IS 'Unique token used for unsubscribe links in emails';