-- Diagnose Supabase Auth Issues
-- Run this to understand what's happening

-- ============================================
-- Check Auth System
-- ============================================

-- 1. Check if auth schema exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') 
        THEN '✅ Auth schema exists' 
        ELSE '❌ Auth schema MISSING - Contact Supabase Support!' 
    END as auth_status;

-- 2. Check auth tables
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'auth' 
AND table_name IN ('users', 'identities', 'sessions', 'refresh_tokens')
ORDER BY table_name;

-- 3. Check if we can query auth.users
DO $$
DECLARE
    user_count INTEGER;
    can_access BOOLEAN := false;
BEGIN
    BEGIN
        SELECT COUNT(*) INTO user_count FROM auth.users;
        can_access := true;
        RAISE NOTICE '✅ Can access auth.users table';
        RAISE NOTICE 'Current user count: %', user_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot access auth.users: %', SQLERRM;
    END;
END $$;

-- 4. Check auth columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name IN ('id', 'email', 'encrypted_password', 'email_confirmed_at', 'created_at')
ORDER BY column_name;

-- 5. Check if instance_id is required
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name = 'instance_id';

-- 6. Try a minimal user insert
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    required_instance_id UUID;
BEGIN
    -- Check if there's a default instance_id
    SELECT id INTO required_instance_id FROM auth.instances LIMIT 1;
    
    IF required_instance_id IS NULL THEN
        required_instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
        RAISE NOTICE 'No instance found, using default: %', required_instance_id;
    ELSE
        RAISE NOTICE 'Found instance_id: %', required_instance_id;
    END IF;
    
    -- Try minimal insert
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            aud,
            role,
            created_at,
            updated_at
        ) VALUES (
            test_id,
            required_instance_id,
            'minimal-test@example.com',
            'authenticated',
            'authenticated',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Minimal user insert successful!';
        DELETE FROM auth.users WHERE id = test_id;
        RAISE NOTICE '✅ Cleanup successful';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Minimal insert failed: %', SQLERRM;
            RAISE NOTICE 'Error detail: %', SQLSTATE;
    END;
END $$;

-- 7. Check for auth constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'auth'
AND tc.table_name = 'users'
AND tc.constraint_type IN ('CHECK', 'UNIQUE', 'FOREIGN KEY')
ORDER BY tc.constraint_type, tc.constraint_name;

-- 8. Check public schema tables
SELECT 
    'Public Tables:' as info,
    string_agg(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 9. Final diagnosis
SELECT '
DIAGNOSIS COMPLETE
==================

Based on the results above:

1. If auth schema is missing → Your Supabase project has a serious issue
2. If auth.users exists but inserts fail → Check constraints and permissions
3. If minimal insert works → The issue is with signup flow configuration

Common fixes:
- Go to Supabase Dashboard > Authentication > Settings
- Ensure your project is not paused
- Check if there are any custom database functions blocking signups
- Try resetting your database password in Settings > Database

For SMS issues specifically:
- SMS requires a configured provider (Twilio, MessageBird, etc.)
- Check Authentication > Providers > Phone
' as diagnosis;