-- Add photo_url column to store progress photo references (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'body_metrics' 
    AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE body_metrics ADD COLUMN photo_url TEXT;
  END IF;
END $$;