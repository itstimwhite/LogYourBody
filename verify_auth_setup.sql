-- Verify authentication setup

-- Check auth configuration
SELECT 
    key,
    value
FROM auth.config
WHERE key IN ('enable_signup', 'enable_anonymous_sign_ins', 'sms_provider', 'sms_enabled')
ORDER BY key;

-- Check if phone auth is enabled
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.config 
            WHERE key = 'sms_provider' AND value IS NOT NULL
        ) THEN 'SMS auth is configured'
        ELSE 'SMS auth is NOT configured'
    END as sms_status;

-- Check for any recent auth errors
SELECT 
    created_at,
    message,
    details
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '1 hour'
AND (
    message LIKE '%error%' 
    OR message LIKE '%fail%'
    OR action = 'signup_failure'
)
ORDER BY created_at DESC
LIMIT 10;

-- Verify the profiles table structure
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('name', 'birthday', 'height', 'email')
ORDER BY ordinal_position;

-- Check if trigger is enabled
SELECT 
    t.tgname,
    t.tgenabled,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

-- Test the handle_new_user function directly (dry run)
SELECT 
    'Function exists and is ready' as status,
    has_function_privilege('public.handle_new_user()', 'execute') as can_execute;