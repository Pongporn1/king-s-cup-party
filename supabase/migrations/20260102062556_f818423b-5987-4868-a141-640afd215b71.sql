-- Add created_by column to paranoia_questions
ALTER TABLE public.paranoia_questions 
ADD COLUMN IF NOT EXISTS created_by text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_paranoia_questions_created_by 
ON public.paranoia_questions(created_by);

-- Update RLS policies to filter by created_by
DROP POLICY IF EXISTS "Users can view their own and default questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Anyone can read paranoia questions" ON public.paranoia_questions;
CREATE POLICY "Users can view their own and default questions" ON public.paranoia_questions
FOR SELECT USING (
  is_default = true OR created_by = current_user
);

DROP POLICY IF EXISTS "Anyone can insert paranoia questions" ON public.paranoia_questions;
CREATE POLICY "Anyone can insert paranoia questions" ON public.paranoia_questions
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update non-default paranoia questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON public.paranoia_questions;
CREATE POLICY "Users can update their own questions" ON public.paranoia_questions
FOR UPDATE USING (
  is_default = false AND (created_by = current_user OR created_by IS NULL)
);

DROP POLICY IF EXISTS "Anyone can delete non-default paranoia questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON public.paranoia_questions;
CREATE POLICY "Users can delete their own questions" ON public.paranoia_questions
FOR DELETE USING (
  is_default = false AND (created_by = current_user OR created_by IS NULL)
);