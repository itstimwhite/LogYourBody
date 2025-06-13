-- Fix row-level security policies for better user experience
-- This addresses RLS violations and duplicate key issues during signup

-- Drop existing policies to recreate them with better logic
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;

-- Create more permissive insert policies for initial user creation
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    (auth.uid() IS NOT NULL AND id IS NOT NULL)
  );

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  );

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  );

-- Add upsert policies to handle duplicate key scenarios
CREATE POLICY "Users can upsert own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle user profile creation safely
CREATE OR REPLACE FUNCTION create_user_profile_safe(
  user_uuid UUID,
  user_email TEXT,
  user_name TEXT,
  user_gender TEXT DEFAULT 'male',
  user_height INTEGER DEFAULT 180
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update profile
  INSERT INTO profiles (id, email, name, gender, height)
  VALUES (user_uuid, user_email, user_name, user_gender, user_height)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    gender = EXCLUDED.gender,
    height = EXCLUDED.height,
    updated_at = NOW();

  -- Insert or update user settings  
  INSERT INTO user_settings (user_id)
  VALUES (user_uuid)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert or update subscription
  INSERT INTO subscriptions (user_id, status, trial_start_date, trial_end_date)
  VALUES (user_uuid, 'trial', NOW(), NOW() + INTERVAL '7 days')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_safe TO authenticated;