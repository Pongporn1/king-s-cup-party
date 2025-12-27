-- Create floating_names table
CREATE TABLE IF NOT EXISTS public.floating_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.floating_names ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON public.floating_names
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert" ON public.floating_names
  FOR INSERT WITH CHECK (true);

-- Allow public delete
CREATE POLICY "Allow public delete" ON public.floating_names
  FOR DELETE USING (true);