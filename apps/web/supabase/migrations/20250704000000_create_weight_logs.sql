-- Create weight_logs table for tracking weight entries
CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    weight_unit TEXT NOT NULL DEFAULT 'kg',
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS weight_logs_user_id_idx ON public.weight_logs(user_id);
CREATE INDEX IF NOT EXISTS weight_logs_logged_at_idx ON public.weight_logs(logged_at DESC);

-- Enable RLS
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_weight_logs_updated_at 
    BEFORE UPDATE ON public.weight_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();