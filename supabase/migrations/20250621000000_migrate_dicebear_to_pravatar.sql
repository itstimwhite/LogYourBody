-- Migration to replace DiceBear avatars with Pravatar URLs
-- This migration updates all avatar URLs that contain 'dicebear' to use pravatar.cc instead

-- Update profiles table
UPDATE public.profiles
SET avatar_url = 
  CASE 
    WHEN username IS NOT NULL THEN 
      'https://i.pravatar.cc/300?u=' || username
    ELSE 
      'https://i.pravatar.cc/300?u=' || id::text
  END,
  updated_at = timezone('utc'::text, now())
WHERE avatar_url LIKE '%dicebear%';

-- Update progress_photos table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'progress_photos'
  ) THEN
    -- Update photo URLs
    UPDATE public.progress_photos pp
    SET 
      photo_url = 
        CASE 
          WHEN p.username IS NOT NULL THEN 
            'https://i.pravatar.cc/600?u=' || p.username || '-' || pp.date || '-' || pp.angle
          ELSE 
            'https://i.pravatar.cc/600?u=' || pp.user_id::text || '-' || pp.date || '-' || pp.angle
        END,
      thumbnail_url = 
        CASE 
          WHEN p.username IS NOT NULL THEN 
            'https://i.pravatar.cc/150?u=' || p.username || '-' || pp.date || '-' || pp.angle
          ELSE 
            'https://i.pravatar.cc/150?u=' || pp.user_id::text || '-' || pp.date || '-' || pp.angle
        END
    FROM public.profiles p
    WHERE pp.user_id = p.id
    AND (pp.photo_url LIKE '%dicebear%' OR pp.thumbnail_url LIKE '%dicebear%');
  END IF;
END $$;

-- Add comment to document the migration
COMMENT ON COLUMN public.profiles.avatar_url IS 'User avatar URL - migrated from DiceBear to Pravatar.cc on 2025-06-21';