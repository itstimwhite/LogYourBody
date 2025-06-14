-- Temporarily disable the auth trigger to isolate the issue
-- Run this to test if the trigger is causing the problem

-- 1. Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Show confirmation
SELECT 'Auth trigger disabled. Try registering a user now.' as message;

-- 3. If registration works after this, the issue is in the trigger
-- 4. To re-enable, run IMMEDIATE_AUTH_FIX.sql again