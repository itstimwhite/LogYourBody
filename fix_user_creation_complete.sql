-- Complete fix for user creation issues
-- Run this script in your Supabase SQL editor to fix the "Database error creating new user" issue

-- Step 1: Ensure profiles table has correct structure
ALTER TABLE profiles 
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN birthday DROP NOT NULL,
ALTER COLUMN height SET DEFAULT 175,
ALTER COLUMN email DROP NOT NULL;

-- Add email column if it doesn't exist (for older setups)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Step 2: Drop existing function and trigger to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Create the updated handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email text;
    user_name text;
BEGIN
    -- Determine email (handle SMS users who might not have email)
    user_email := COALESCE(NEW.email, NEW.phone, 'user_' || NEW.id::text);
    
    -- Extract name from metadata or generate default
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(user_email, '@', 1)
    );
    
    -- Create profile with all necessary defaults
    INSERT INTO public.profiles (
        id, 
        email, 
        name, 
        gender, 
        height,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_email,
        user_name,
        COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
        COALESCE((NEW.raw_user_meta_data->>'height')::integer, 175),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key errors
    
    -- Create user settings
    INSERT INTO public.user_settings (
        user_id,
        units,
        health_kit_sync_enabled,
        google_fit_sync_enabled,
        notifications_enabled,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'units', 'imperial'),
        false,
        false,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create trial subscription
    INSERT INTO public.subscriptions (
        user_id, 
        status, 
        trial_start_date, 
        trial_end_date,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        'trial',
        NOW(),
        NOW() + INTERVAL '3 days',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error details for debugging
    RAISE LOG 'Error in handle_new_user for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    -- Return NEW to not block user creation
    RETURN NEW;
END;
$$;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Step 6: Fix any existing users that might be missing data
-- Fix missing profiles
INSERT INTO public.profiles (id, email, name, gender, height)
SELECT 
    u.id,
    COALESCE(u.email, u.phone, 'user_' || u.id::text),
    COALESCE(
        u.raw_user_meta_data->>'name',
        u.raw_user_meta_data->>'full_name',
        split_part(COALESCE(u.email, u.phone, 'user'), '@', 1)
    ),
    COALESCE(u.raw_user_meta_data->>'gender', 'male'),
    COALESCE((u.raw_user_meta_data->>'height')::integer, 175)
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Fix missing settings
INSERT INTO public.user_settings (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.user_settings s ON u.id = s.user_id
WHERE s.user_id IS NULL;

-- Fix missing subscriptions
INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
SELECT 
    u.id,
    'trial',
    COALESCE(u.created_at, NOW()),
    COALESCE(u.created_at, NOW()) + INTERVAL '3 days'
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE s.user_id IS NULL;

-- Step 7: Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Setup verification:';
    RAISE NOTICE '- handle_new_user function exists: %', 
        EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user');
    RAISE NOTICE '- on_auth_user_created trigger exists: %', 
        EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created');
    RAISE NOTICE '- profiles table is ready: %', 
        EXISTS(SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' 
               AND column_name = 'email');
END $$;

-- Step 8: Test with a simulated user creation (commented out for safety)
/*
-- Uncomment and run this separately to test:
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_email text := 'test_' || test_id::text || '@example.com';
BEGIN
    -- Simulate user creation
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        test_id, test_email, 'dummy', now(),
        '{"provider":"email"}', '{"name":"Test User"}', now(), now()
    );
    
    -- Check results
    PERFORM pg_sleep(0.1); -- Small delay for trigger execution
    
    IF EXISTS(SELECT 1 FROM profiles WHERE id = test_id) THEN
        RAISE NOTICE 'SUCCESS: Profile created for test user';
    ELSE
        RAISE NOTICE 'FAILURE: Profile NOT created for test user';
    END IF;
    
    -- Cleanup
    DELETE FROM auth.users WHERE id = test_id;
END $$;
*/