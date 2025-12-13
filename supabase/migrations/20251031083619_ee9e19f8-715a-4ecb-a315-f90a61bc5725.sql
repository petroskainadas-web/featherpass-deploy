-- Create newsletter_subscribers table
-- Designed for future ConvertKit synchronization
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed BOOLEAN NOT NULL DEFAULT false,
  convertkit_synced BOOLEAN NOT NULL DEFAULT false,
  convertkit_subscriber_id TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Only editors can view subscribers
CREATE POLICY "Editors can view subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- Editors can update for ConvertKit sync
CREATE POLICY "Editors can update subscriber data"
ON public.newsletter_subscribers
FOR UPDATE
USING (has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

-- Create index on convertkit_synced for future sync jobs
CREATE INDEX idx_newsletter_subscribers_convertkit_synced ON public.newsletter_subscribers(convertkit_synced) WHERE convertkit_synced = false;