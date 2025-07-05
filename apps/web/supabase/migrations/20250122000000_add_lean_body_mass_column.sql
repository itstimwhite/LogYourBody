-- Add lean_body_mass column to body_metrics table
ALTER TABLE public.body_metrics
ADD COLUMN IF NOT EXISTS lean_body_mass DECIMAL(6,2);

-- Add comment
COMMENT ON COLUMN public.body_metrics.lean_body_mass IS 'Lean body mass in kg (total weight minus fat mass)';

-- Also add missing columns that are being used in the app
ALTER TABLE public.body_metrics
ADD COLUMN IF NOT EXISTS waist DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS neck DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS hip DECIMAL(5,2);

-- Add comments for the new columns
COMMENT ON COLUMN public.body_metrics.waist IS 'Waist circumference measurement';
COMMENT ON COLUMN public.body_metrics.neck IS 'Neck circumference measurement';
COMMENT ON COLUMN public.body_metrics.hip IS 'Hip circumference measurement (mainly for females)';