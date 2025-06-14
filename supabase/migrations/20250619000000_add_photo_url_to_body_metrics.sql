-- Add photo_url column to store progress photo references
ALTER TABLE body_metrics
ADD COLUMN photo_url TEXT;
