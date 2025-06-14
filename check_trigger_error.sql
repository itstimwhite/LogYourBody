-- Check if the trigger and function exist
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user';

-- Check trigger status
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as is_enabled,
    tgtype
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check for recent errors in logs
SELECT 
    id,
    created_at,
    message,
    details
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '1 hour'
AND (message LIKE '%error%' OR message LIKE '%fail%')
ORDER BY created_at DESC
LIMIT 10;

-- Check if auth.users table is accessible
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';

-- Check RLS policies on profiles table
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
WHERE schemaname = 'public' AND tablename = 'profiles';