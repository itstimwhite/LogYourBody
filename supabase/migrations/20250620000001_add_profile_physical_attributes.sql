-- Add physical attributes to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS height_unit VARCHAR(2) DEFAULT 'cm' CHECK (height_unit IN ('cm', 'ft')),
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20) DEFAULT 'moderately_active' 
  CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'));

-- Add constraints for height
ALTER TABLE public.profiles
ADD CONSTRAINT valid_height CHECK (height IS NULL OR (height > 0 AND height < 300));

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.height IS 'Height in cm or total inches depending on height_unit';
COMMENT ON COLUMN public.profiles.height_unit IS 'Unit for height: cm for metric, ft for imperial (stored as total inches)';
COMMENT ON COLUMN public.profiles.gender IS 'User gender for body composition calculations';
COMMENT ON COLUMN public.profiles.activity_level IS 'Physical activity level for TDEE calculations';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_gender_idx ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS profiles_activity_level_idx ON public.profiles(activity_level);