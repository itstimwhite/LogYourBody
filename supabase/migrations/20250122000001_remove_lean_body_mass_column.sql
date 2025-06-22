-- Remove lean_body_mass column from body_metrics table
-- This should be calculated from weight and body_fat_percentage, not stored
ALTER TABLE public.body_metrics
DROP COLUMN IF EXISTS lean_body_mass;

-- Add bone_mass column for DEXA scan data
-- This cannot be calculated and must be stored when available
ALTER TABLE public.body_metrics
ADD COLUMN IF NOT EXISTS bone_mass DECIMAL(5,2);

COMMENT ON COLUMN public.body_metrics.bone_mass IS 'Bone mass in kg from DEXA scan (cannot be calculated)';