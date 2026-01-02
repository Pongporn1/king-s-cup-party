-- Fix RLS policies for paranoia_questions
-- The previous policies used current_user which doesn't work with anon users
-- We allow all operations and handle filtering in the frontend

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own and default questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Anyone can insert paranoia questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Anyone can update non-default paranoia questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Anyone can delete non-default paranoia questions" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Allow public read access" ON public.paranoia_questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.paranoia_questions;

-- Create simple open policies (filtering is done client-side based on created_by)
CREATE POLICY "Allow public read access" ON public.paranoia_questions
FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.paranoia_questions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update non-default questions" ON public.paranoia_questions
FOR UPDATE USING (is_default = false);

CREATE POLICY "Allow delete non-default questions" ON public.paranoia_questions
FOR DELETE USING (is_default = false);
