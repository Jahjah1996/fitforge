-- 1. Create the food_logs table
CREATE TABLE IF NOT EXISTS public.food_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name  TEXT NOT NULL,
  calories   INTEGER NOT NULL,
  protein_g  NUMERIC NOT NULL,
  carbs_g    NUMERIC NOT NULL,
  fat_g      NUMERIC NOT NULL,
  date       TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- 3. Policies: users can only manage their own logs
CREATE POLICY "Users can manage own logs" 
  ON public.food_logs
  FOR ALL 
  USING (auth.uid() = user_id);
