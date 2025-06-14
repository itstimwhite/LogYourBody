-- Test user creation scenarios

-- Check if the handle_new_user function exists
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'handle_new_user';

-- Check if the trigger exists
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype,
    tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check profiles table constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if we have any users without profiles
SELECT 
    u.id,
    u.email,
    u.phone,
    u.created_at,
    p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Check if we have any users without settings
SELECT 
    u.id,
    u.email,
    s.user_id as settings_id
FROM auth.users u
LEFT JOIN public.user_settings s ON u.id = s.user_id
WHERE s.user_id IS NULL;

-- Check if we have any users without subscriptions
SELECT 
    u.id,
    u.email,
    sub.user_id as subscription_id
FROM auth.users u
LEFT JOIN public.subscriptions sub ON u.id = sub.user_id
WHERE sub.user_id IS NULL;