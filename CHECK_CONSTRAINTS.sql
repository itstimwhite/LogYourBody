-- Check for constraints that might be blocking user creation

-- 1. Check foreign key constraints
SELECT 
    conname as constraint_name,
    contype as type,
    conrelid::regclass as table_name,
    confrelid::regclass as references_table
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND contype = 'f'
ORDER BY conrelid::regclass::text;

-- 2. Check unique constraints
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND contype = 'u'
ORDER BY conrelid::regclass::text;

-- 3. Check primary key constraints
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND contype = 'p'
ORDER BY conrelid::regclass::text;

-- 4. Check if there are any CHECK constraints
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND contype = 'c'
ORDER BY conrelid::regclass::text;