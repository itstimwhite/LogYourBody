-- Add goal fields to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS goal_body_fat_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS goal_ffmi DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS goal_waist_to_hip_ratio DECIMAL(5,3),
ADD COLUMN IF NOT EXISTS goal_waist_to_height_ratio DECIMAL(5,3),
ADD COLUMN IF NOT EXISTS goal_weight DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS goal_weight_unit VARCHAR(10) DEFAULT 'kg';

-- Add comments to document the research-based defaults
COMMENT ON COLUMN user_profiles.goal_body_fat_percentage IS 'Target body fat percentage. Research suggests: Males 10-12%, Females 18-22% (Dixson 2010, Tovée 2002)';
COMMENT ON COLUMN user_profiles.goal_ffmi IS 'Target Fat-Free Mass Index. Research suggests: Males ~22 (Kouri 1995)';
COMMENT ON COLUMN user_profiles.goal_waist_to_hip_ratio IS 'Target waist-to-hip ratio. Research suggests: Males ~0.9, Females 0.7 (Singh 1993)';
COMMENT ON COLUMN user_profiles.goal_waist_to_height_ratio IS 'Target waist-to-height ratio. Research suggests: Males 0.45-0.50, Females 0.42-0.48 (Brooks 2010)';

-- Create a function to set default goals based on gender
CREATE OR REPLACE FUNCTION set_default_goals()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set defaults if goals are null and gender is provided
  IF NEW.gender IS NOT NULL THEN
    IF NEW.gender = 'male' THEN
      NEW.goal_body_fat_percentage := COALESCE(NEW.goal_body_fat_percentage, 11.0); -- Middle of 10-12%
      NEW.goal_ffmi := COALESCE(NEW.goal_ffmi, 22.0);
      NEW.goal_waist_to_hip_ratio := COALESCE(NEW.goal_waist_to_hip_ratio, 0.9);
      NEW.goal_waist_to_height_ratio := COALESCE(NEW.goal_waist_to_height_ratio, 0.475); -- Middle of 0.45-0.50
    ELSIF NEW.gender = 'female' THEN
      NEW.goal_body_fat_percentage := COALESCE(NEW.goal_body_fat_percentage, 20.0); -- Middle of 18-22%
      NEW.goal_ffmi := COALESCE(NEW.goal_ffmi, NULL); -- Not commonly studied for females
      NEW.goal_waist_to_hip_ratio := COALESCE(NEW.goal_waist_to_hip_ratio, 0.7);
      NEW.goal_waist_to_height_ratio := COALESCE(NEW.goal_waist_to_height_ratio, 0.45); -- Middle of 0.42-0.48
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set default goals
DROP TRIGGER IF EXISTS set_default_goals_trigger ON user_profiles;
CREATE TRIGGER set_default_goals_trigger
BEFORE INSERT OR UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_default_goals();

-- Update existing users with default goals where not set
UPDATE user_profiles
SET 
  goal_body_fat_percentage = CASE 
    WHEN gender = 'male' THEN COALESCE(goal_body_fat_percentage, 11.0)
    WHEN gender = 'female' THEN COALESCE(goal_body_fat_percentage, 20.0)
    ELSE goal_body_fat_percentage
  END,
  goal_ffmi = CASE 
    WHEN gender = 'male' THEN COALESCE(goal_ffmi, 22.0)
    ELSE goal_ffmi
  END,
  goal_waist_to_hip_ratio = CASE 
    WHEN gender = 'male' THEN COALESCE(goal_waist_to_hip_ratio, 0.9)
    WHEN gender = 'female' THEN COALESCE(goal_waist_to_hip_ratio, 0.7)
    ELSE goal_waist_to_hip_ratio
  END,
  goal_waist_to_height_ratio = CASE 
    WHEN gender = 'male' THEN COALESCE(goal_waist_to_height_ratio, 0.475)
    WHEN gender = 'female' THEN COALESCE(goal_waist_to_height_ratio, 0.45)
    ELSE goal_waist_to_height_ratio
  END
WHERE gender IS NOT NULL;

-- Add waist and hip measurements to body_metrics if not already present
ALTER TABLE body_metrics
ADD COLUMN IF NOT EXISTS waist_circumference DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS hip_circumference DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS waist_unit VARCHAR(10) DEFAULT 'cm';

-- Add comments for new measurement fields
COMMENT ON COLUMN body_metrics.waist_circumference IS 'Waist circumference measurement';
COMMENT ON COLUMN body_metrics.hip_circumference IS 'Hip circumference measurement';
COMMENT ON COLUMN body_metrics.waist_unit IS 'Unit for waist and hip measurements (cm or in)';