-- Check Supabase Auth System Issues
-- Run each query separately to diagnose auth problems

-- 1. Check if email auth is enabled (this is stored in auth.config)
SELECT 
    'Check Supabase Dashboard → Authentication → Providers → Email' as instruction,
    'Make sure Email provider is ENABLED' as requirement;

-- 2. Count existing users
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. Check for recent failed auth attempts
SELECT 
    created_at,
    ip_address,
    email
FROM auth.audit_log_entries
WHERE action = 'user_signup_attempt'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check instance configuration
SELECT 
    id as instance_id,
    uuid as instance_uuid,
    created_at
FROM auth.schema_migrations
LIMIT 1;

-- 5. Check if there's a custom email domain restriction
SELECT 
    'Check if your Supabase project has:' as check_item,
    '1. Email domain restrictions' as item1,
    '2. Rate limiting enabled' as item2,
    '3. Custom auth hooks' as item3,
    '4. The project is not paused' as item4;

-- 6. Try to identify any auth blockers
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users LIMIT 1) 
        THEN 'Auth system has users - basic functionality works'
        ELSE 'No users found - might be fresh install or issue'
    END as auth_status;

-- 7. Check auth.users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name IN ('id', 'email', 'encrypted_password', 'email_confirmed_at')
ORDER BY ordinal_position;

-- 8. Manual test with minimal data
-- Try this manually with a unique email
/*
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'manual_test_' || extract(epoch from now())::text || '@test.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);
*/

-- 9. Common issues to check in Supabase Dashboard:
SELECT 
    'GO TO SUPABASE DASHBOARD AND CHECK:' as action,
    '1. Authentication → Settings → Email Auth is ENABLED' as step1,
    '2. Authentication → Email Templates → Confirm signup is DISABLED for testing' as step2,
    '3. Project Settings → API → Service role key is correct' as step3,
    '4. Database → Database Webhooks → No failing webhooks' as step4,
    '5. Edge Functions → No auth interceptors' as step5;