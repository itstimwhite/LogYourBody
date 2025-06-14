-- Diagnostic Script: Identify User Registration Issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- ========================================
-- STEP 1: Check Table Structure
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING TABLE STRUCTURES';
    RAISE NOTICE '========================================';
END $$;

-- Check profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check user_settings table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_settings'
ORDER BY ordinal_position;

-- Check subscriptions table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ========================================
-- STEP 2: Check Trigger and Function
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING TRIGGERS AND FUNCTIONS';
    RAISE NOTICE '========================================';
END $$;

-- Check if trigger exists and is enabled
SELECT 
    tgname as trigger_name,
    tgenabled as is_enabled,
    tgisinternal as is_internal
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT 
    proname as function_name,
    pronargs as num_args,
    prosecdef as security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ========================================
-- STEP 3: Check RLS Policies
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING RLS POLICIES';
    RAISE NOTICE '========================================';
END $$;

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_settings', 'subscriptions');

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_settings', 'subscriptions')
ORDER BY tablename, policyname;

-- ========================================
-- STEP 4: Test Trigger Execution
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTING TRIGGER EXECUTION';
    RAISE NOTICE '========================================';
END $$;

-- Create a test user to see if trigger fires
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_email text := 'trigger_test_' || extract(epoch from now())::text || '@test.com';
    profile_exists boolean;
    settings_exists boolean;
    subscription_exists boolean;
BEGIN
    -- Insert test user
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at,
        raw_app_meta_data, 
        raw_user_meta_data, 
        created_at, 
        updated_at,
        aud,
        role
    ) VALUES (
        test_id, 
        test_email, 
        crypt('dummy_password', gen_salt('bf')), 
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Trigger Test User"}',
        now(), 
        now(),
        'authenticated',
        'authenticated'
    );
    
    -- Wait a moment for trigger
    PERFORM pg_sleep(0.5);
    
    -- Check if trigger created the records
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = test_id) INTO profile_exists;
    SELECT EXISTS(SELECT 1 FROM public.user_settings WHERE user_id = test_id) INTO settings_exists;
    SELECT EXISTS(SELECT 1 FROM public.subscriptions WHERE user_id = test_id) INTO subscription_exists;
    
    RAISE NOTICE 'Test user ID: %', test_id;
    RAISE NOTICE 'Profile created: %', profile_exists;
    RAISE NOTICE 'Settings created: %', settings_exists;
    RAISE NOTICE 'Subscription created: %', subscription_exists;
    
    -- Cleanup
    DELETE FROM auth.users WHERE id = test_id;
    
    IF NOT profile_exists OR NOT settings_exists OR NOT subscription_exists THEN
        RAISE NOTICE '';
        RAISE NOTICE 'TRIGGER IS NOT WORKING PROPERLY!';
        RAISE NOTICE 'This is likely the cause of user registration failures.';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE 'TRIGGER IS WORKING CORRECTLY!';
        RAISE NOTICE 'The issue might be elsewhere in the registration flow.';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during test: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    -- Cleanup on error
    DELETE FROM auth.users WHERE id = test_id;
END $$;

-- ========================================
-- STEP 5: Check for Common Issues
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING FOR COMMON ISSUES';
    RAISE NOTICE '========================================';
END $$;

-- Check for missing constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as foreign_table
FROM pg_constraint
WHERE conrelid IN (
    'public.profiles'::regclass,
    'public.user_settings'::regclass,
    'public.subscriptions'::regclass
)
ORDER BY conrelid, conname;

-- Check for duplicate triggers
SELECT 
    count(*) as trigger_count,
    tgname
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
GROUP BY tgname
HAVING count(*) > 1;

-- ========================================
-- STEP 6: Recent Error Logs
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING RECENT ERRORS (if available)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Note: Error logs may not be available in all Supabase environments';
END $$;

-- Try to check for recent errors (this may not work in all environments)
-- You may need to check Supabase dashboard logs instead
SELECT 
    'Check Supabase Dashboard > Logs > Postgres Logs for recent errors' as message;

-- ========================================
-- FINAL RECOMMENDATIONS
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'After running this diagnostic:';
    RAISE NOTICE '1. Look for any FALSE values in RLS enabled columns';
    RAISE NOTICE '2. Check if the trigger test passed or failed';
    RAISE NOTICE '3. Review the table structures for any issues';
    RAISE NOTICE '4. Check Supabase Dashboard logs for specific error messages';
    RAISE NOTICE '';
    RAISE NOTICE 'Common fixes:';
    RAISE NOTICE '- Enable RLS on tables if disabled';
    RAISE NOTICE '- Ensure all required columns allow NULL or have defaults';
    RAISE NOTICE '- Check for conflicting triggers or functions';
END $$;