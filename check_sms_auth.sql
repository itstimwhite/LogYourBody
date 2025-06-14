-- Quick SMS Auth Diagnostic
-- Run this in Supabase SQL Editor to check SMS configuration

-- 1. Check if auth instance exists
SELECT COUNT(*) as instance_count FROM auth.instances;

-- 2. Check if phone columns exist in auth.users
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name IN ('phone', 'phone_confirmed_at', 'phone_change', 'phone_change_token')
ORDER BY column_name;

-- 3. Test creating a user with phone directly
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    instance_id UUID;
BEGIN
    -- Get instance ID
    SELECT id INTO instance_id FROM auth.instances LIMIT 1;
    IF instance_id IS NULL THEN
        instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
        -- Try to create instance
        INSERT INTO auth.instances (id, uuid, raw_base_config, created_at, updated_at)
        VALUES (instance_id, instance_id, '{}'::jsonb, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Try to create a phone user
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            phone,
            phone_confirmed_at,
            created_at,
            updated_at,
            aud,
            role
        ) VALUES (
            test_id,
            instance_id,
            '+15559999999',
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE '✅ Phone user creation works!';
        DELETE FROM auth.users WHERE id = test_id;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Phone user creation failed: %', SQLERRM;
            RAISE NOTICE 'Error detail: %', SQLSTATE;
    END;
END $$;

-- 4. Check for any auth triggers that might be blocking
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- 5. Final status
SELECT 
    'If you see "Phone user creation works!" above, the issue is with the API layer, not the database.' as diagnosis,
    'If you see an error, we need to fix the auth schema.' as next_step;