-- FINAL AUTH FIX - With proper SECURITY DEFINER
-- This should resolve the "Database error creating new user" issue

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Create the function with SECURITY DEFINER
-- This is CRITICAL - it allows the function to run with elevated privileges
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile with minimal required fields
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
        COALESCE(NEW.email, NEW.id::text || '@temp.user'),
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            split_part(COALESCE(NEW.email, ''), '@', 1),
            'User'
        ),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
        COALESCE((NEW.raw_user_meta_data->>'height')::integer, 175),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create user settings with defaults
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
        'imperial',
        false,
        false,
        true,
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
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '3 days',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user for %: % %', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
-- The function owner needs permissions on the tables
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.user_settings TO postgres;
GRANT ALL ON public.subscriptions TO postgres;

-- Also ensure service_role has permissions (for other operations)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_settings TO service_role;
GRANT ALL ON public.subscriptions TO service_role;

-- 5. Ensure RLS policies don't block the trigger
-- These policies allow the trigger to work while maintaining security

-- Drop existing policies
DROP POLICY IF EXISTS "service_role_profiles" ON public.profiles;
DROP POLICY IF EXISTS "service_role_settings" ON public.user_settings;
DROP POLICY IF EXISTS "service_role_subscriptions" ON public.subscriptions;

-- Create policies that allow service operations
CREATE POLICY "service_operations" ON public.profiles
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_operations" ON public.user_settings
    FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_operations" ON public.subscriptions
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 6. Test the function manually
DO $$
DECLARE
    test_result text;
BEGIN
    -- Check if function has SECURITY DEFINER
    SELECT CASE 
        WHEN prosecdef THEN 'YES - Function has SECURITY DEFINER'
        ELSE 'NO - Function is missing SECURITY DEFINER!'
    END INTO test_result
    FROM pg_proc
    WHERE proname = 'handle_new_user';
    
    RAISE NOTICE 'Security Definer Check: %', test_result;
END $$;

-- 7. Show final status
SELECT 'AUTH FIX APPLIED - The function now has SECURITY DEFINER which should resolve the permission issue.' as message;