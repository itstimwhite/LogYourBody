-- Migration to clear all user data for fresh testing
-- Run this migration when you want to flush the database

-- Delete all body metrics
DELETE FROM body_metrics;

-- Delete all subscriptions
DELETE FROM subscriptions;

-- Delete all user settings
DELETE FROM user_settings;

-- Delete all profiles
DELETE FROM profiles;

-- Note: This will NOT delete auth.users - those need to be deleted via Supabase Auth
-- To fully reset, you'll also need to delete users from the Supabase Auth dashboard

-- Reset any sequences if needed
-- (None in our current schema, but good practice)

-- Migration completed - all user data cleared

-- Log the reset
-- Note: Consider adding a reset_log table for production environments