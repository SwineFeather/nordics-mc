
-- Create login_tokens table for TokenLink authentication
CREATE TABLE IF NOT EXISTS public.login_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_uuid TEXT NOT NULL,
    player_name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at BIGINT NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Enable RLS on login_tokens table
ALTER TABLE public.login_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for login_tokens
CREATE POLICY "Allow public read access to login tokens" 
    ON public.login_tokens FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert access to login tokens" 
    ON public.login_tokens FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update access to login tokens" 
    ON public.login_tokens FOR UPDATE 
    USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_login_tokens_token ON public.login_tokens(token);
CREATE INDEX IF NOT EXISTS idx_login_tokens_player_uuid ON public.login_tokens(player_uuid);
CREATE INDEX IF NOT EXISTS idx_login_tokens_expires_at ON public.login_tokens(expires_at);

-- Add cleanup function for expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.login_tokens 
  WHERE expires_at < EXTRACT(EPOCH FROM NOW()) * 1000 
    OR (used = true AND created_at < NOW() - INTERVAL '1 hour');
END;
$$;
