-- Complete Auth System Check
-- Run each section to diagnose the exact issue

-- 1. Check Email Confirmation Settings
SELECT 
    'CHECK SUPABASE DASHBOARD:' as action,
    'Authentication → Settings → Email → Disable "Confirm email" for testing' as step;

-- 2. Check for duplicate emails/phones
SELECT 
    'Checking for duplicate emails in auth.users...' as check;

SELECT 
    email, 
    COUNT(*) as count
FROM auth.users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- 3. Check unique constraints on auth.users
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass
AND contype = 'u';  -- unique constraints

-- 4. Check if we're using the right auth method
SELECT 
    'VERIFY CLIENT CODE:' as check,
    'Using supabase.auth.signUp() not admin API' as requirement;

-- 5. Check RLS on auth.users (should typically be disabled)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'auth'
AND tablename = 'users';

-- 6. Check if there are any RLS policies on auth.users
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'auth'
AND tablename = 'users';

-- 7. Test if we can read from auth.users
DO $$
BEGIN
    PERFORM COUNT(*) FROM auth.users;
    RAISE NOTICE 'SUCCESS: Can read from auth.users';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILED: Cannot read auth.users - %', SQLERRM;
END $$;

-- 8. Check auth configuration
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email_confirmed_at IS NULL AND created_at > NOW() - INTERVAL '1 day')
        THEN 'WARNING: Found unconfirmed users - email confirmation might be required'
        ELSE 'No recent unconfirmed users found'
    END as email_confirmation_check;

-- 9. Test creating a user with explicit instance_id
DO $$
DECLARE
    test_email text := 'complete_check_' || extract(epoch from now())::text || '@test.com';
    instance_id uuid;
    test_result text;
BEGIN
    -- Get a valid instance_id
    SELECT DISTINCT auth.users.instance_id 
    INTO instance_id
    FROM auth.users 
    WHERE auth.users.instance_id IS NOT NULL 
    LIMIT 1;
    
    IF instance_id IS NULL THEN
        instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
    
    -- Try to create user with all required fields
    BEGIN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            instance_id,
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            test_email,
            crypt('TestPassword123!', gen_salt('bf')),
            NOW(), -- confirmed immediately
            NOW(),
            NOW(),
            '',    -- empty tokens
            '',
            '',
            ''
        );
        
        test_result := 'SUCCESS: Direct user creation worked with all fields!';
        
        -- Cleanup
        DELETE FROM auth.users WHERE email = test_email;
        
    EXCEPTION WHEN OTHERS THEN
        test_result := 'FAILED: ' || SQLERRM;
    END;
    
    RAISE NOTICE '%', test_result;
END $$;

-- 10. Check if anon role can execute auth functions
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
    pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE') as auth_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'auth'
AND p.proname LIKE '%signup%' OR p.proname LIKE '%user%'
ORDER BY p.proname;

-- 11. Final recommendations
SELECT 
    E'\n=== DIAGNOSIS SUMMARY ===\n' ||
    '1. Check email confirmation is DISABLED in dashboard\n' ||
    '2. Ensure no duplicate emails exist\n' ||
    '3. Verify using supabase.auth.signUp() in client\n' ||
    '4. Check test results above for specific errors\n' ||
    '5. If all else fails, the issue is Supabase infrastructure' as summary;