-- Make birthday field optional to fix signup issues
-- This allows users to create profiles without immediately providing their birthday

-- Remove NOT NULL constraint from birthday field
ALTER TABLE profiles ALTER COLUMN birthday DROP NOT NULL;

-- Update birthday field to have a sensible default for existing records with null values
UPDATE profiles SET birthday = '1990-01-01' WHERE birthday IS NULL;