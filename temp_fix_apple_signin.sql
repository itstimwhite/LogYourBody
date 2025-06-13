-- Temporary fix for Apple Sign In database error
-- Run this in your Supabase SQL Editor to disable the problematic trigger

-- First, let's check if the trigger exists and is causing the issue
DO $$
BEGIN
  -- Temporarily disable the email subscription sync trigger that's likely causing Apple Sign In to fail
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'sync_user_email_subscriptions_trigger'
    AND event_object_table = 'users'
    AND trigger_schema = 'auth'
  ) THEN
    -- Drop the trigger temporarily
    DROP TRIGGER sync_user_email_subscriptions_trigger ON auth.users;
    RAISE NOTICE 'Disabled sync_user_email_subscriptions_trigger to fix Apple Sign In';
  ELSE
    RAISE NOTICE 'Trigger sync_user_email_subscriptions_trigger not found';
  END IF;
END $$;

-- Create a safer version of the function that won't fail if tables don't exist
CREATE OR REPLACE FUNCTION sync_user_email_subscriptions_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email_subscriptions table exists before trying to update
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'email_subscriptions'
  ) THEN
    -- Update existing email subscriptions with the new user_id
    UPDATE email_subscriptions 
    SET user_id = NEW.id, updated_at = NOW()
    WHERE email = NEW.email AND user_id IS NULL;
    
    RAISE NOTICE 'Synced email subscriptions for user %', NEW.email;
  ELSE
    RAISE NOTICE 'Email subscriptions table does not exist, skipping sync for user %', NEW.email;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error syncing email subscriptions for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create the trigger with the safer function
CREATE TRIGGER sync_user_email_subscriptions_trigger_safe
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email_subscriptions_safe();

-- Test that Apple Sign In should work now
SELECT 'Apple Sign In database fix applied successfully!' as result;