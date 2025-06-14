-- Allow email to be NULL in profiles table for SMS-only signups
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- Convert empty string emails to NULL for consistency
UPDATE profiles SET email = NULL WHERE email = '';
