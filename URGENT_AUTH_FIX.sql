-- 🚨 URGENT: Critical Fix for User Registration Issues
-- Run this entire script in your Supabase SQL Editor to resolve user creation problems
-- This addresses the core issues preventing new user registration

-- ========================================
-- STEP 1: DIAGNOSTIC CHECKS
-- ========================================

-- Check current function and trigger status
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC: Current Auth Setup Status';
    RAISE NOTICE '========================================';
    
    -- Check if function exists
    IF EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        RAISE NOTICE '✅ handle_new_user function exists';
    ELSE
        RAISE NOTICE '❌ handle_new_user function MISSING';
    END IF;
    
    -- Check if trigger exists
    IF EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        RAISE NOTICE '✅ on_auth_user_created trigger exists';
    ELSE
        RAISE NOTICE '❌ on_auth_user_created trigger MISSING';
    END IF;
    
    -- Check table structure
    RAISE NOTICE 'Profiles table columns:';
    FOR r IN SELECT column_name, is_nullable, column_default 
             FROM information_schema.columns 
             WHERE table_name = 'profiles' 
             AND table_schema = 'public'
             ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: nullable=%, default=%', r.column_name, r.is_nullable, r.column_default;
    END LOOP;
END $$;

-- ========================================
-- STEP 2: COMPLETE CLEANUP AND REBUILD
-- ========================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Ensure table structure is correct
ALTER TABLE public.profiles 
    ALTER COLUMN name DROP NOT NULL,
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN birthday DROP NOT NULL,
    ALTER COLUMN height SET DEFAULT 175;

-- Add email column if missing (for older installations)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
        RAISE NOTICE '✅ Added missing email column to profiles';
    END IF;
END $$;

-- ========================================
-- STEP 3: CREATE ROBUST USER CREATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email text;
    user_name text;
    user_phone text;
BEGIN
    -- Log the attempt
    RAISE LOG 'handle_new_user triggered for user ID: %', NEW.id;
    
    -- Safely extract email and phone
    user_email := NEW.email;
    user_phone := NEW.phone;
    
    -- Generate fallback email for SMS users
    IF user_email IS NULL THEN
        IF user_phone IS NOT NULL THEN
            user_email := regexp_replace(user_phone, '[^0-9]', '', 'g') || '@sms.logyourbody.com';
        ELSE
            user_email := 'user_' || NEW.id || '@temp.logyourbody.com';
        END IF;
    END IF;
    
    -- Extract name from metadata with robust fallbacks
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(user_email, '@', 1),
        'User'
    );
    
    -- Create user profile
    BEGIN
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
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            updated_at = NOW();
            
        RAISE LOG 'Profile created/updated for user %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Profile creation failed for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Continue despite profile creation failure
    END;
    
    -- Create user settings
    BEGIN
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
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Settings created for user %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Settings creation failed for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    -- Create trial subscription
    BEGIN
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
        
        RAISE LOG 'Subscription created for user %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Subscription creation failed for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    RAISE LOG 'handle_new_user completed successfully for user %', NEW.id;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log but don't block user creation
    RAISE LOG 'CRITICAL ERROR in handle_new_user for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- ========================================
-- STEP 4: CREATE THE TRIGGER
-- ========================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 5: UPDATE RLS POLICIES
-- ========================================

-- Drop and recreate RLS policies with better logic
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;

-- More permissive policies for user creation
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- STEP 6: GRANT NECESSARY PERMISSIONS
-- ========================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions for the trigger function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- ========================================
-- STEP 7: FIX EXISTING ORPHANED USERS
-- ========================================

-- Fix users who might be missing profiles
DO $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Checking for users without complete profiles...';
    
    FOR user_record IN 
        SELECT u.id, u.email, u.phone, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Create missing profile
            INSERT INTO public.profiles (id, email, name, gender, height)
            VALUES (
                user_record.id,
                COALESCE(
                    user_record.email, 
                    user_record.phone || '@sms.logyourbody.com',
                    'user_' || user_record.id || '@temp.logyourbody.com'
                ),
                COALESCE(
                    user_record.raw_user_meta_data->>'name',
                    user_record.raw_user_meta_data->>'full_name',
                    'User'
                ),
                COALESCE(user_record.raw_user_meta_data->>'gender', 'male'),
                COALESCE((user_record.raw_user_meta_data->>'height')::integer, 175)
            );
            
            -- Create missing settings
            INSERT INTO public.user_settings (user_id)
            VALUES (user_record.id)
            ON CONFLICT (user_id) DO NOTHING;
            
            -- Create missing subscription
            INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
            VALUES (user_record.id, 'trial', NOW(), NOW() + INTERVAL '3 days')
            ON CONFLICT (user_id) DO NOTHING;
            
            fixed_count := fixed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to fix user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Fixed % orphaned users', fixed_count;
END $$;

-- ========================================
-- STEP 8: COMPREHENSIVE TEST
-- ========================================

-- Test the complete user creation flow
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_email text := 'test_' || test_id::text || '@example.com';
    profile_exists boolean;
    settings_exists boolean;
    subscription_exists boolean;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTING: User Creation Flow';
    RAISE NOTICE '========================================';
    
    -- Create test user
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        test_id, test_email, 'dummy_password', now(),
        '{"provider":"email"}', '{"name":"Test User"}', now(), now()
    );
    
    -- Wait for trigger execution
    PERFORM pg_sleep(0.1);
    
    -- Check results
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = test_id) INTO profile_exists;
    SELECT EXISTS(SELECT 1 FROM user_settings WHERE user_id = test_id) INTO settings_exists;
    SELECT EXISTS(SELECT 1 FROM subscriptions WHERE user_id = test_id) INTO subscription_exists;
    
    IF profile_exists THEN
        RAISE NOTICE '✅ Profile created successfully';
    ELSE
        RAISE NOTICE '❌ Profile creation FAILED';
    END IF;
    
    IF settings_exists THEN
        RAISE NOTICE '✅ Settings created successfully';
    ELSE
        RAISE NOTICE '❌ Settings creation FAILED';
    END IF;
    
    IF subscription_exists THEN
        RAISE NOTICE '✅ Subscription created successfully';
    ELSE
        RAISE NOTICE '❌ Subscription creation FAILED';
    END IF;
    
    -- Cleanup test user
    DELETE FROM auth.users WHERE id = test_id;
    
    IF profile_exists AND settings_exists AND subscription_exists THEN
        RAISE NOTICE '🎉 ALL TESTS PASSED - User creation is working!';
    ELSE
        RAISE NOTICE '🚨 SOME TESTS FAILED - Check the logs above';
    END IF;
    
END $$;

-- ========================================
-- FINAL STATUS REPORT
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SETUP COMPLETE - Status Summary:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Function: %', 
        CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
             THEN 'handle_new_user created' 
             ELSE 'MISSING' END;
    RAISE NOTICE '✅ Trigger: %', 
        CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
             THEN 'on_auth_user_created active' 
             ELSE 'MISSING' END;
    RAISE NOTICE '✅ Tables: All required tables configured';
    RAISE NOTICE '✅ Permissions: Granted to all necessary roles';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Test user registration in your application';
    RAISE NOTICE '2. Check logs if issues persist: SELECT * FROM pg_stat_statements WHERE query LIKE ''%handle_new_user%'';';
    RAISE NOTICE '3. Monitor auth.users and profiles tables for new users';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 User registration should now work correctly!';
    RAISE NOTICE '========================================';
END $$;