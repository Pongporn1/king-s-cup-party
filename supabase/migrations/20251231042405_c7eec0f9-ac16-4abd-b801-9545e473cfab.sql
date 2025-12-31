-- Add columns to paranoia_questions
ALTER TABLE paranoia_questions 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE paranoia_questions 
SET is_default = true, created_at = now()
WHERE is_default IS NULL;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert paranoia questions" ON paranoia_questions;
DROP POLICY IF EXISTS "Anyone can update non-default paranoia questions" ON paranoia_questions;
DROP POLICY IF EXISTS "Anyone can delete non-default paranoia questions" ON paranoia_questions;

-- Create new policies
CREATE POLICY "Anyone can insert paranoia questions" ON paranoia_questions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update non-default paranoia questions" ON paranoia_questions
FOR UPDATE USING (is_default = false);

CREATE POLICY "Anyone can delete non-default paranoia questions" ON paranoia_questions
FOR DELETE USING (is_default = false);

-- Create game_covers table
CREATE TABLE IF NOT EXISTS public.game_covers (
    id text PRIMARY KEY,
    title text NOT NULL,
    cover_url text,
    emoji text,
    gradient text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default game data
INSERT INTO public.game_covers (id, title, emoji, gradient) VALUES
('doraemon', 'King''s Cup', '🎴', 'from-red-500 to-orange-600'),
('5-sec', '5 Second Rule', '⏱️', 'from-amber-500 to-yellow-600'),
('pokdeng', 'Pok Deng', '🃏', 'from-green-500 to-emerald-600'),
('undercover', 'Undercover', '🕵️', 'from-purple-500 to-indigo-600'),
('paranoia', 'Paranoia', '🤫', 'from-pink-500 to-rose-600')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS and policies for game_covers
ALTER TABLE public.game_covers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.game_covers
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update" ON public.game_covers
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated insert" ON public.game_covers
    FOR INSERT WITH CHECK (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_covers;