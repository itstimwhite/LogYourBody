-- Create data_exports table for temporary storage of export data
CREATE TABLE IF NOT EXISTS public.data_exports (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'csv')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for cleanup queries
CREATE INDEX idx_data_exports_expires_at ON public.data_exports(expires_at);
CREATE INDEX idx_data_exports_user_id ON public.data_exports(user_id);

-- Enable RLS
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (edge functions)
CREATE POLICY "Service role can manage exports" ON public.data_exports
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create function to clean up expired exports (can be called by a cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_exports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.data_exports
    WHERE expires_at < NOW();
END;
$$;

-- Optional: Create a scheduled job to clean up expired exports
-- This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-exports', '0 * * * *', 'SELECT public.cleanup_expired_exports();');