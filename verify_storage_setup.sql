-- Check if the storage bucket was created
SELECT id, name, public, created_at, updated_at
FROM storage.buckets
WHERE id = 'progress-photos';

-- Check storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%photo%'
ORDER BY policyname;

-- Check if photo_url column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'body_metrics' 
AND column_name = 'photo_url';

-- Check if name is nullable in profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'name';