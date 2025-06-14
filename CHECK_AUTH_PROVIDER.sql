-- Check Auth Provider Configuration
-- This checks if email auth is properly configured

-- 1. Check if any users have been created recently
SELECT 
    'Recent user creation attempts:' as info,
    COUNT(*) as users_last_hour,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 2. Check instance_id distribution
SELECT 
    'Instance ID check:' as info,
    CASE 
        WHEN instance_id IS NULL THEN 'NULL' 
        ELSE instance_id::text 
    END as instance_id,
    COUNT(*) as count,
    MIN(created_at) as oldest_user,
    MAX(created_at) as newest_user
FROM auth.users
GROUP BY instance_id
ORDER BY count DESC;

-- 3. Test if email already exists
-- Replace with actual test email if you know one
DO $$
DECLARE
    test_email text := 'test@example.com';
    email_exists boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = test_email
    ) INTO email_exists;
    
    IF email_exists THEN
        RAISE NOTICE 'Email % already exists - this would cause signup to fail', test_email;
    ELSE
        RAISE NOTICE 'Email % does not exist - signup should work', test_email;
    END IF;
END $$;

-- 4. List all auth-related triggers
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    n.nspname || '.' || c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'auth'
ORDER BY n.nspname, c.relname, t.tgname;

-- 5. CRITICAL: Check Supabase Dashboard Settings
SELECT 
    E'\n=== MUST CHECK IN SUPABASE DASHBOARD ===\n\n' ||
    '1. Go to: Authentication → Providers\n' ||
    '   - Ensure "Email" is ENABLED (toggle should be ON)\n\n' ||
    '2. Go to: Authentication → Settings → Email Auth\n' ||
    '   - DISABLE "Confirm email" (for testing)\n' ||
    '   - ENABLE "Enable email signup"\n' ||
    '   - Check "Enable custom SMTP" is OFF (use Supabase default)\n\n' ||
    '3. Go to: Authentication → Settings → Security\n' ||
    '   - Check "Enable email confirmation" is OFF\n' ||
    '   - Check rate limits (default 3 per hour)\n\n' ||
    '4. Go to: Project Settings → API\n' ||
    '   - Ensure project is not paused\n' ||
    '   - Copy anon key and verify it matches your app\n\n' ||
    'If Email provider is disabled, that is your issue!' as critical_checks;