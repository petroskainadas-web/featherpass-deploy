-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster token lookups
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert reset tokens (edge function will do this)
CREATE POLICY "Anyone can insert reset tokens"
ON public.password_reset_tokens
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can read non-expired, unused tokens (for validation)
CREATE POLICY "Anyone can read valid tokens"
ON public.password_reset_tokens
FOR SELECT
USING (NOT used AND expires_at > now());

-- Policy: Anyone can update tokens to mark as used
CREATE POLICY "Anyone can mark tokens as used"
ON public.password_reset_tokens
FOR UPDATE
USING (NOT used AND expires_at > now())
WITH CHECK (used = true);

-- Function to clean up expired tokens (can be called by cron later)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < now() - INTERVAL '1 day';
END;
$$;