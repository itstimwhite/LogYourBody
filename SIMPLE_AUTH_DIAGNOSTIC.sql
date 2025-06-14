-- Simple Auth Diagnostic Script
-- Run each section separately in Supabase SQL Editor

-- 1. Check table columns
SELECT 'PROFILES TABLE' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 'USER_SETTINGS TABLE' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_settings'
ORDER BY ordinal_position;

SELECT 'SUBSCRIPTIONS TABLE' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 2. Check if trigger exists
SELECT 'TRIGGER CHECK' as check_type;
SELECT tgname as trigger_name, tgenabled as is_enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 3. Check if function exists
SELECT 'FUNCTION CHECK' as check_type;
SELECT proname as function_name, prosecdef as security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 4. Check RLS status
SELECT 'RLS STATUS' as check_type;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_settings', 'subscriptions');

-- 5. Check existing policies
SELECT 'RLS POLICIES' as check_type;
SELECT tablename, policyname, cmd, permissive, roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_settings', 'subscriptions')
ORDER BY tablename, policyname;

-- 6. Quick manual test - Run this separately
-- This will help identify if the trigger is working
DO $$
DECLARE
    test_id uuid := '11111111-1111-1111-1111-111111111111';
    test_email text := 'manual_test@example.com';
    profile_exists boolean;
BEGIN
    -- Clean up any existing test data
    DELETE FROM public.profiles WHERE id = test_id;
    DELETE FROM public.user_settings WHERE user_id = test_id;
    DELETE FROM public.subscriptions WHERE user_id = test_id;
    DELETE FROM auth.users WHERE id = test_id;
    
    -- Insert test user
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        test_id, test_email, 'dummy', now(),
        '{"provider":"email"}', '{"name":"Test User"}', now(), now()
    );
    
    -- Wait a moment
    PERFORM pg_sleep(1);
    
    -- Check if profile was created
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = test_id) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE 'SUCCESS: Trigger is working! Profile was created.';
    ELSE
        RAISE NOTICE 'FAILED: Trigger did not create profile. This is the problem.';
    END IF;
    
    -- Cleanup
    DELETE FROM auth.users WHERE id = test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    -- Cleanup on error
    DELETE FROM auth.users WHERE id = test_id;
END $$;