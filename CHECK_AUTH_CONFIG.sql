-- Check Supabase Auth Configuration
-- This will help identify if there are auth-level restrictions

-- 1. Check auth schema permissions
SELECT 
    nspname as schema_name,
    array_agg(DISTINCT privilege_type) as privileges,
    grantee
FROM information_schema.usage_privileges
WHERE object_schema = 'auth'
GROUP BY nspname, grantee
ORDER BY grantee;

-- 2. Check if auth.users table has any unusual settings
SELECT 
    relname as table_name,
    relkind as type,
    relhasrules as has_rules,
    relhastriggers as has_triggers,
    relrowsecurity as row_security_enabled
FROM pg_class
WHERE relnamespace = 'auth'::regnamespace
AND relname = 'users';

-- 3. Check for any policies on auth.users (there shouldn't be any normally)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'auth'
AND tablename = 'users';

-- 4. Check auth configuration
SELECT 
    name,
    setting,
    category
FROM pg_settings
WHERE name LIKE '%auth%'
OR name IN ('max_connections', 'shared_buffers', 'work_mem');

-- 5. Check if there are any auth-related functions that might be interfering
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'auth'
AND p.proname LIKE '%user%'
ORDER BY p.proname;

-- 6. Check for any custom constraints on auth.users
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass
AND contype NOT IN ('p', 'f'); -- Exclude primary and foreign keys

-- 7. Check if the auth schema is accessible
DO $$
BEGIN
    -- Try to count users in auth.users
    DECLARE
        user_count integer;
    BEGIN
        SELECT COUNT(*) INTO user_count FROM auth.users;
        RAISE NOTICE 'Auth.users table is accessible. Current user count: %', user_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Cannot access auth.users: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    END;
END $$;