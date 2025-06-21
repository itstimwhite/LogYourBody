-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public photo access" ON storage.objects;

-- Ensure the photos bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'photos';

-- Create improved storage policies

-- 1. Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- 2. Authenticated users can view all photos (since bucket is public)
CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'photos');

-- 3. Users can update their own photos
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING (
    bucket_id = 'photos' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- 4. Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'photos' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Create a function to get the correct public URL format
CREATE OR REPLACE FUNCTION get_public_photo_url(file_path text)
RETURNS text AS $$
BEGIN
  RETURN 'https://ihivupqpctpkrgqgxfjf.supabase.co/storage/v1/object/public/photos/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION get_public_photo_url(text) IS 'Returns the correct public URL for a photo in the storage bucket';