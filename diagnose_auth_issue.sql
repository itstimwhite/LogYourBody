-- Diagnostic script to check authentication setup
-- Run this in your Supabase SQL editor

-- 1. Check if handle_new_user function exists
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user' 
AND n.nspname = 'public';

-- 2. Check if trigger exists
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype,
    tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 3. Check profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check for any existing constraint violations
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND conrelid::regclass::text LIKE '%profiles%';

-- 5. Check if there are any errors in the PostgreSQL logs related to user creation
-- This would need to be checked in the Supabase dashboard logs

-- 6. Test the function directly (be careful with this in production)
-- This simulates what happens when a new user is created
/*
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    -- First create a test user in auth.users
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        test_user_id,
        'test_' || test_user_id::text || '@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        ''
    );
    
    -- Check if the trigger created the related records
    RAISE NOTICE 'Profile exists: %', EXISTS(SELECT 1 FROM profiles WHERE id = test_user_id);
    RAISE NOTICE 'Settings exist: %', EXISTS(SELECT 1 FROM user_settings WHERE user_id = test_user_id);
    RAISE NOTICE 'Subscription exists: %', EXISTS(SELECT 1 FROM subscriptions WHERE user_id = test_user_id);
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_user_id;
END $$;
*/