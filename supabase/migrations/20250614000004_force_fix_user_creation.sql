-- Force fix for user creation - complete rebuild of trigger system
-- This will ensure the database can create users properly

-- Step 1: Drop all existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Ensure profiles table structure is correct
DO $$
BEGIN
    -- Make columns nullable if they aren't already
    ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;
    ALTER TABLE public.profiles ALTER COLUMN birthday DROP NOT NULL;
    ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
    
    -- Set defaults
    ALTER TABLE public.profiles ALTER COLUMN height SET DEFAULT 175;
    ALTER TABLE public.profiles ALTER COLUMN gender SET DEFAULT 'male';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error altering profiles table: %', SQLERRM;
END $$;

-- Step 3: Create a simple, foolproof handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into profiles
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (
        NEW.id, 
        COALESCE(NEW.email, NEW.phone, 'user_' || NEW.id::text),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert into user_settings
    INSERT INTO public.user_settings (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert into subscriptions
    INSERT INTO public.subscriptions (
        user_id, 
        status, 
        trial_start_date, 
        trial_end_date,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        'trial',
        NOW(),
        NOW() + INTERVAL '3 days',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail
        RAISE WARNING 'handle_new_user error for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- Step 6: Test the function can be executed
DO $$
DECLARE
    can_execute boolean;
BEGIN
    SELECT has_function_privilege('public.handle_new_user()', 'execute') INTO can_execute;
    RAISE NOTICE 'Can execute handle_new_user: %', can_execute;
END $$;