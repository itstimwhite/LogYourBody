-- Debug Auth Failure - Find the root cause
-- Run each section separately

-- 1. Check instance_id status
SELECT 
    'Checking instance_id values...' as status;

SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT instance_id) as unique_instances,
    COUNT(CASE WHEN instance_id IS NULL THEN 1 END) as null_instances
FROM auth.users;

-- 2. Get a sample instance_id
SELECT 
    instance_id,
    COUNT(*) as user_count
FROM auth.users
WHERE instance_id IS NOT NULL
GROUP BY instance_id
LIMIT 5;

-- 3. Check for recent failed signups
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'Unconfirmed'
        ELSE 'Confirmed'
    END as status
FROM auth.users
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are any auth schema permissions issues
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'auth'
AND table_name = 'users'
AND grantee IN ('postgres', 'anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- 5. Test minimal user creation with logging
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_email text := 'debug_' || extract(epoch from now())::text || '@test.com';
    instance_id uuid;
    error_detail text;
BEGIN
    -- Get a valid instance_id
    SELECT auth.users.instance_id 
    INTO instance_id
    FROM auth.users 
    WHERE auth.users.instance_id IS NOT NULL 
    LIMIT 1;
    
    -- Log what we're about to do
    RAISE NOTICE 'Attempting to create user with:';
    RAISE NOTICE '  ID: %', test_id;
    RAISE NOTICE '  Email: %', test_email;
    RAISE NOTICE '  Instance ID: %', COALESCE(instance_id::text, 'NULL');
    
    -- Try the insert
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            created_at,
            updated_at
        ) VALUES (
            test_id,
            COALESCE(instance_id, '00000000-0000-0000-0000-000000000000'::uuid),
            'authenticated',
            'authenticated',
            test_email,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'SUCCESS: User created!';
        
        -- Check if profile trigger fired
        PERFORM pg_sleep(0.5);
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_id) THEN
            RAISE NOTICE 'Profile was created by trigger';
        ELSE
            RAISE NOTICE 'No profile created - trigger may not be working';
        END IF;
        
        -- Cleanup
        DELETE FROM auth.users WHERE id = test_id;
        
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_detail = PG_EXCEPTION_DETAIL;
        RAISE NOTICE 'FAILED: %', SQLERRM;
        RAISE NOTICE 'Error Detail: %', error_detail;
        RAISE NOTICE 'SQL State: %', SQLSTATE;
    END;
END $$;

-- 6. Check if this is a Supabase-specific issue
SELECT 
    current_database() as database,
    version() as postgres_version,
    current_setting('server_version_num')::integer as version_number;

-- 7. Final check - are we hitting any limits?
SELECT 
    'Check these potential issues:' as issue,
    '1. Rate limiting (3-5 signups per hour from same IP)' as check1,
    '2. Database connection limits reached' as check2,
    '3. Supabase project storage quota exceeded' as check3,
    '4. Custom auth hooks failing (check Edge Functions)' as check4;