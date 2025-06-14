-- Fix user creation to support all authentication methods
-- This ensures users can be created via email, SMS, or social auth

-- First, ensure the profiles table has the correct nullable constraints
ALTER TABLE profiles 
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN birthday DROP NOT NULL,
ALTER COLUMN height SET DEFAULT 175;

-- Update the handle_new_user function to properly handle all user creation scenarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with sensible defaults and optional fields
  INSERT INTO public.profiles (id, email, name, gender, height)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.phone, 'user_' || NEW.id::text),  -- Handle SMS users without email
    NEW.raw_user_meta_data->>'name',  -- Optional name from metadata
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),  -- Default gender if not provided
    COALESCE((NEW.raw_user_meta_data->>'height')::integer, 175)  -- Default height if not provided
  );
  
  -- Create user settings with defaults
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Create trial subscription
  INSERT INTO public.subscriptions (
    user_id, 
    status, 
    trial_start_date, 
    trial_end_date
  )
  VALUES (
    NEW.id,
    'trial',
    NOW(),
    NOW() + INTERVAL '3 days'
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing users that might be missing profile data
INSERT INTO public.profiles (id, email, name, gender, height)
SELECT 
  u.id,
  COALESCE(u.email, u.phone, 'user_' || u.id::text),
  u.raw_user_meta_data->>'name',
  COALESCE(u.raw_user_meta_data->>'gender', 'male'),
  COALESCE((u.raw_user_meta_data->>'height')::integer, 175)
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Fix any existing users missing settings
INSERT INTO public.user_settings (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.user_settings s ON u.id = s.user_id
WHERE s.user_id IS NULL;

-- Fix any existing users missing subscriptions
INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
SELECT 
  u.id,
  'trial',
  COALESCE(u.created_at, NOW()),
  COALESCE(u.created_at, NOW()) + INTERVAL '3 days'
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE s.user_id IS NULL;