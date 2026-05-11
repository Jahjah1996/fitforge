-- =============================================================
-- FitForge Supabase Setup Script
-- Run this in your Supabase project's SQL Editor:
-- https://supabase.com/dashboard/project/nsotzoyhllncdmerfhsx/sql
-- =============================================================

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT,
  daily_calorie_target   INTEGER,
  daily_protein_target   INTEGER,
  daily_carbs_target     INTEGER,
  daily_fat_target       INTEGER,
  last_bmr               NUMERIC,
  last_tdee              NUMERIC,
  calculator_profile     TEXT,   -- JSON stringified
  workout_profile        TEXT,   -- JSON stringified
  saved_workout_plan     TEXT,   -- JSON stringified
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies: users can only read/write their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Trigger function: auto-create a profile when a user signs up
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

-- 5. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
