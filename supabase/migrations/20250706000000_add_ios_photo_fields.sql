-- Add iOS-specific photo-related columns to body_metrics table
-- These are additional fields needed by the iOS app for photo processing
ALTER TABLE body_metrics 
ADD COLUMN IF NOT EXISTS original_photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'Manual';

-- Add comments for clarity
COMMENT ON COLUMN body_metrics.original_photo_url IS 'URL to the original unprocessed photo before Cloudinary processing';
COMMENT ON COLUMN body_metrics.photo_processed_at IS 'Timestamp when the photo was processed by Cloudinary';
COMMENT ON COLUMN body_metrics.data_source IS 'Source of the metrics data: Manual, HealthKit, or DEXA';

-- Add index for faster photo queries (if not already exists from web migration)
CREATE INDEX IF NOT EXISTS idx_body_metrics_photo_url 
ON body_metrics(photo_url) 
WHERE photo_url IS NOT NULL;

-- Ensure the photos bucket has proper configuration for iOS app
-- The web app already creates this bucket, but we ensure it has the right settings
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
WHERE id = 'photos';

-- Note: Storage policies are already created by web migrations
-- The iOS app should use the 'photos' bucket instead of 'progress-photos'
-- This ensures compatibility between web and iOS apps