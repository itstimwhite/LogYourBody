-- Add constraints to profiles table for height
-- Height should be between 30cm (1ft) and 244cm (8ft)
ALTER TABLE profiles 
ADD CONSTRAINT height_range_check 
CHECK (
  (height_unit = 'cm' AND height BETWEEN 30 AND 244) OR
  (height_unit = 'ft' AND height BETWEEN 12 AND 96) OR
  height IS NULL
);

-- Add constraints to body_metrics table for weight
-- Weight should be between 11.3kg (25lbs) and 453.6kg (1000lbs)
ALTER TABLE body_metrics
ADD CONSTRAINT weight_range_check
CHECK (
  (weight_unit = 'kg' AND weight BETWEEN 11.3 AND 453.6) OR
  (weight_unit = 'lbs' AND weight BETWEEN 25 AND 1000) OR
  weight IS NULL
);

-- Add constraints to profiles table for goal weight
ALTER TABLE profiles
ADD CONSTRAINT goal_weight_range_check
CHECK (
  (goal_weight_unit = 'kg' AND goal_weight BETWEEN 11.3 AND 453.6) OR
  (goal_weight_unit = 'lbs' AND goal_weight BETWEEN 25 AND 1000) OR
  goal_weight IS NULL
);

-- Add reasonable constraints for body measurements
ALTER TABLE body_metrics
ADD CONSTRAINT waist_range_check
CHECK (
  (waist_unit = 'cm' AND waist_circumference BETWEEN 40 AND 200) OR
  (waist_unit = 'in' AND waist_circumference BETWEEN 16 AND 80) OR
  waist_circumference IS NULL
);

ALTER TABLE body_metrics
ADD CONSTRAINT hip_range_check
CHECK (
  (waist_unit = 'cm' AND hip_circumference BETWEEN 50 AND 200) OR
  (waist_unit = 'in' AND hip_circumference BETWEEN 20 AND 80) OR
  hip_circumference IS NULL
);

-- Add constraints for body fat percentage (0-70%)
ALTER TABLE body_metrics
ADD CONSTRAINT body_fat_percentage_range_check
CHECK (body_fat_percentage BETWEEN 0 AND 70 OR body_fat_percentage IS NULL);

ALTER TABLE profiles
ADD CONSTRAINT goal_body_fat_percentage_range_check
CHECK (goal_body_fat_percentage BETWEEN 0 AND 70 OR goal_body_fat_percentage IS NULL);

-- Add constraints for ratios
ALTER TABLE profiles
ADD CONSTRAINT goal_waist_to_hip_ratio_range_check
CHECK (goal_waist_to_hip_ratio BETWEEN 0.4 AND 1.5 OR goal_waist_to_hip_ratio IS NULL);

ALTER TABLE profiles
ADD CONSTRAINT goal_waist_to_height_ratio_range_check
CHECK (goal_waist_to_height_ratio BETWEEN 0.3 AND 0.8 OR goal_waist_to_height_ratio IS NULL);

-- Add constraint for FFMI (typically between 10-30 for natural athletes)
ALTER TABLE profiles
ADD CONSTRAINT goal_ffmi_range_check
CHECK (goal_ffmi BETWEEN 10 AND 30 OR goal_ffmi IS NULL);

-- Add constraint for muscle mass (should be less than total weight)
ALTER TABLE body_metrics
ADD CONSTRAINT muscle_mass_range_check
CHECK (muscle_mass < weight OR muscle_mass IS NULL);

-- Add comment explaining the constraints
COMMENT ON CONSTRAINT height_range_check ON profiles IS 'Ensures height is between 1ft (30cm) and 8ft (244cm)';
COMMENT ON CONSTRAINT weight_range_check ON body_metrics IS 'Ensures weight is between 25lbs (11.3kg) and 1000lbs (453.6kg)';
COMMENT ON CONSTRAINT body_fat_percentage_range_check ON body_metrics IS 'Ensures body fat percentage is between 0% and 70%';
COMMENT ON CONSTRAINT muscle_mass_range_check ON body_metrics IS 'Ensures muscle mass is less than total body weight';