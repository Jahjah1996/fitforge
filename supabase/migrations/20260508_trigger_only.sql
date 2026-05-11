-- =============================================================
-- FitForge: Add auto-profile trigger ONLY (table already exists)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nsotzoyhllncdmerfhsx/sql
-- =============================================================

-- Trigger function: auto-create a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
