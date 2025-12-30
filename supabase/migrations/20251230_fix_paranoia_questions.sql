-- Fix paranoia_questions table structure
-- Add missing columns and update structure to match code

-- 1. Add is_default column
ALTER TABLE public.paranoia_questions 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- 2. Add created_at column
ALTER TABLE public.paranoia_questions 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. Update existing records to be default questions
UPDATE public.paranoia_questions 
SET is_default = true, created_at = now()
WHERE is_default IS NULL;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert paranoia questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Anyone can update non-default paranoia questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Anyone can delete non-default paranoia questions" ON public.paranoia_questions;

-- 5. Add policy for inserting custom questions
CREATE POLICY "Anyone can insert paranoia questions" ON public.paranoia_questions
FOR INSERT WITH CHECK (true);

-- 6. Add policy for updating custom questions (only non-default)
CREATE POLICY "Anyone can update non-default paranoia questions" ON public.paranoia_questions
FOR UPDATE USING (is_default = false);

-- 7. Add policy for deleting custom questions (only non-default)
CREATE POLICY "Anyone can delete non-default paranoia questions" ON public.paranoia_questions
FOR DELETE USING (is_default = false);
