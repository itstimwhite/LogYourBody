-- Check and Fix Auth Issues
-- Run this BEFORE the main fix script to diagnose auth problems

-- ============================================
-- PART 1: Check Auth Configuration
-- ============================================

-- Check if auth schema exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') 
        THEN '✅ Auth schema exists' 
        ELSE '❌ Auth schema missing!' 
    END as auth_schema_status;

-- Check if auth.users table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'auth' AND table_name = 'users'
        ) 
        THEN '✅ Auth users table exists' 
        ELSE '❌ Auth users table missing!' 
    END as auth_users_status;

-- Check current auth instance settings
SELECT 
    key,
    value
FROM auth.config
WHERE key IN (
    'disable_signup',
    'email_auth_enabled', 
    'phone_auth_enabled',
    'sms_provider',
    'mailer_autoconfirm',
    'sms_autoconfirm'
)
ORDER BY key;

-- ============================================
-- PART 2: Check for Auth Restrictions
-- ============================================

-- Check if there are any auth hooks that might be blocking
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- Check for any custom functions on auth.users
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- ============================================
-- PART 3: Fix Common Auth Issues
-- ============================================

-- Ensure email and phone auth are enabled
UPDATE auth.config 
SET value = 'true' 
WHERE key = 'email_auth_enabled';

UPDATE auth.config 
SET value = 'true' 
WHERE key = 'phone_auth_enabled';

-- Disable signup restrictions
UPDATE auth.config 
SET value = 'false' 
WHERE key = 'disable_signup';

-- For testing, enable auto-confirm
UPDATE auth.config 
SET value = 'true' 
WHERE key = 'mailer_autoconfirm';

UPDATE auth.config 
SET value = 'true' 
WHERE key = 'sms_autoconfirm';

-- ============================================
-- PART 4: Check Auth Permissions
-- ============================================

-- Check if service role can access auth schema
SELECT 
    has_schema_privilege('service_role', 'auth', 'USAGE') as service_role_auth_access,
    has_table_privilege('service_role', 'auth.users', 'INSERT') as service_role_insert_users;

-- Grant necessary permissions if missing
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;

-- ============================================
-- PART 5: Test Auth Functions
-- ============================================

-- Test if we can query auth.users
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE 'Current user count: %', user_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error accessing auth.users: %', SQLERRM;
END $$;

-- ============================================
-- PART 6: Create Test User Directly (Testing Only)
-- ============================================

-- Try to create a test user directly in auth.users
-- This bypasses all application logic to test raw auth functionality
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Generate a test user ID
    test_user_id := gen_random_uuid();
    
    -- Try to insert directly into auth.users
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        instance_id,
        aud,
        role
    ) VALUES (
        test_user_id,
        'test-direct-' || extract(epoch from now()) || '@example.com',
        crypt('TestPassword123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated'
    );
    
    RAISE NOTICE '✅ Test user created successfully with ID: %', test_user_id;
    
    -- Clean up the test user
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE '✅ Test user cleaned up successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error creating test user: %', SQLERRM;
        RAISE NOTICE 'This error indicates the auth system issue: %', SQLSTATE;
END $$;

-- ============================================
-- PART 7: Final Status Report
-- ============================================

SELECT 
    '=== AUTH SYSTEM STATUS ===' as report;

SELECT 
    'Email confirmations: ' || COALESCE(
        (SELECT value FROM auth.config WHERE key = 'mailer_autoconfirm'),
        'not set'
    ) as setting;

SELECT 
    'SMS confirmations: ' || COALESCE(
        (SELECT value FROM auth.config WHERE key = 'sms_autoconfirm'),
        'not set'
    ) as setting;

SELECT 
    'Signup disabled: ' || COALESCE(
        (SELECT value FROM auth.config WHERE key = 'disable_signup'),
        'not set'
    ) as setting;

SELECT 
    'Total users: ' || COUNT(*) as user_count
FROM auth.users;

-- ============================================
-- INSTRUCTIONS
-- ============================================
SELECT '
NEXT STEPS:
1. Run this script first to check auth status
2. If you see any ❌ errors, contact Supabase support
3. After running this, run fix_database_complete.sql
4. Go to Authentication > Settings and verify:
   - Email auth is enabled
   - Phone auth is enabled  
   - Confirm email is OFF (for testing)
   - Confirm phone is OFF (for testing)
5. Try creating a user in Authentication > Users tab
' as instructions;