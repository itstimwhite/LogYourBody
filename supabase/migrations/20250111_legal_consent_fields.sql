-- Add legal consent fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS legal_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT false;

-- Create index for faster consent lookups
CREATE INDEX IF NOT EXISTS idx_profiles_legal_accepted_at ON profiles (id, legal_accepted_at);

-- Comment on columns
COMMENT ON COLUMN profiles.legal_accepted_at IS 'Timestamp when user accepted legal terms';
COMMENT ON COLUMN profiles.terms_accepted IS 'Whether user has accepted terms of service';
COMMENT ON COLUMN profiles.privacy_accepted IS 'Whether user has accepted privacy policy';