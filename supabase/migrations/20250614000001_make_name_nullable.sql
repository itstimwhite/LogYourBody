-- Make name column nullable in profiles table
ALTER TABLE profiles 
ALTER COLUMN name DROP NOT NULL;

-- Update the handle_new_user function to handle optional name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with optional name
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Only set name if provided in metadata, otherwise NULL
    NEW.raw_user_meta_data->>'name'
  );
  
  -- Create settings
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;