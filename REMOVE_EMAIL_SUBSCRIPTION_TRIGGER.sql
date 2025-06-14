-- Remove the email subscription trigger that's causing auth failures
-- This trigger is trying to update a table that doesn't exist

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS sync_user_email_subscriptions_trigger ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS sync_user_email_subscriptions();

-- 3. Check if email_subscriptions table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'email_subscriptions'
        ) THEN 'Table email_subscriptions EXISTS'
        ELSE 'Table email_subscriptions DOES NOT EXIST'
    END as status;

-- 4. List all triggers on auth.users to ensure we removed the right one
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgrelid = 'auth.users'::regclass
AND NOT tgisinternal
ORDER BY tgname;

-- 5. Summary
SELECT 
    'Email subscription trigger removed!' as status,
    'Try creating a user now - it should work.' as action;